import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Chart } from 'chart.js/auto';
import { UserService } from '../../services/user.service';
import { ToastrService } from 'ngx-toastr';
import { EmployeeService } from '../../services/employee.service';
import { InvoiceService } from '../../services/invoice.service';
import { Invoice } from '../../model/Invoice';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import 'jspdf-autotable';
import { PaymentService } from '../../services/payment.service';
import { Transaction, TransactionService } from '../../services/transaction.service';
import { Router } from '@angular/router';
import { HelpServiceService } from '../../services/help-service.service';
import * as Papa from 'papaparse';
import { AuthService } from '../../services/auth.service';

  @Component({
    selector: 'app-dashboard',
    imports: [CommonModule,FormsModule],
    standalone: true,
    templateUrl: './dashboard.component.html',
    styleUrl: './dashboard.component.css'
  })
  export class DashboardComponent {
    selectedRequestId: any;

    constructor(private userService: UserService,private toastr: ToastrService,private employeeService: EmployeeService,private invoiceService: InvoiceService,private paymentService: PaymentService,private transactionService: TransactionService,private router: Router,private helpService:HelpServiceService,private authService: AuthService) {}

    ngOnInit() {
      const empId = localStorage.getItem('employeeId');
      if (!empId) {
        console.error('Employee ID not found in localStorage!');
      }
      this.loggedInEmployeeId = empId || '';
      this.fetchUsers();
      this.fetchEmployees();
      this.fetchInvoices();
      this.fetchBillCount();
      this.setBillDates();
      this.fetchUserCount();
      this.loadHelpRequests()
      this.fetchTransactions();
      this.fetchTodayAmountReceived();
    }

    loggedInEmployeeId: string = '';
    activeTab: string = 'home'; 
    homeData = { users: 0 , bills: 0, amount:0};

    fetchUserCount() {
      this.userService.getUserCount().subscribe((data) => {
        this.homeData.users = data;
        console.log(this.homeData.users);
      });
    }

    fetchBillCount() {
      this.invoiceService.getBillCount().subscribe((data) => {
        this.homeData.bills = data;
        console.log(this.homeData.bills);
      });
    }

    fetchTodayAmountReceived() {
      this.paymentService.getTodayAmount().subscribe((data) => {
        this.homeData.amount = data;
        console.log("Today's Amount Received:", this.homeData.amount);
      });
    }

    showHome() {
      this.activeTab = 'home';
    }

    logout() {
      const confirmLogout = window.confirm('Are you sure you want to log out?');
      if (confirmLogout) {
        this.authService.logout().subscribe({
          next: (response) => {
            console.log('User logged out');
            localStorage.removeItem('employeeId');
            localStorage.removeItem('sessionId');
            localStorage.setItem('logout-event', Date.now().toString());
            localStorage.clear();
            sessionStorage.clear();
            this.toastr.success(response.message, 'Logout');
            this.router.navigate(['/login']);
          },
          error: (error) => {
            console.error('Error during logout:', error);
            this.toastr.error('Error during logout. Please try again.', 'Error');
          }
        });
      }
    }
    
     
    users: any[] = [];
    employees: any[] = [];
    searchQuery: string = '';
    currentPage: number = 0;
    pageSize: number = 4;
    searchQuery1: string = '';
    currentPage1: number = 0;
    pageSize1: number = 4;

    fetchUsers() {
      this.userService.getUsers().subscribe(data => {
        this.users = data;
      });
    }

    fetchEmployees() {
      this.employeeService.getEmployees().subscribe(data => {
        this.employees = data;
      });
    }

    filteredUsers() {
      return this.users.filter(user =>
        user.customerId.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        user.serviceConnectionNo.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        user.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        user.phone.includes(this.searchQuery) ||
        user.address.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        user.unitsConsumption.toString().includes(this.searchQuery) ||
        user.startDate.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    }

    filteredEmployees() {
      return this.employees.filter(employees =>
        employees.employeeId.toLowerCase().includes(this.searchQuery1.toLowerCase()) ||
        employees.name.toLowerCase().includes(this.searchQuery1.toLowerCase()) ||
        employees.email.toLowerCase().includes(this.searchQuery1.toLowerCase()) ||
        employees.phone.includes(this.searchQuery1)
      );
    }

    getPaginatedUsers() {
      const filtered = this.filteredUsers();
      const startIndex = this.currentPage * this.pageSize;
      return filtered.slice(startIndex, startIndex + this.pageSize);
    }

    changePage(page: number) {
      if(this.totalPages === 0){
        this.currentPage = 0;
      }
      else if (page >= 0 && page < this.totalPages) {
        this.currentPage = page;
      }
    }

    changePage1(page: number) {
      if (page >= 0 && page < this.totalPages1) {
        this.currentPage1 = page;
      }
    }

    getPaginatedEmployees() {
      const filtered = this.filteredEmployees();
      const startIndex = this.currentPage1 * this.pageSize1;
      return filtered.slice(startIndex, startIndex + this.pageSize1);
    }


    get totalPages() {
      return Math.ceil(this.filteredUsers().length / this.pageSize);
    }

    get totalPages1() {
      return Math.ceil(this.filteredEmployees().length / this.pageSize1);
    }

    showAddCustomerModal: boolean = false;
    newCustomer: any = {
      customerId: '',
      serviceConnectionNo: '',
      name: '',
      email: '',
      phone: '',
      address: '',
      startDate: '',
      unitsConsumption: 0 
    };

    openAddCustomerModal() {
      this.showAddCustomerModal = true;
    }

    closeAddCustomerModal() {
      this.showAddCustomerModal = false;
    }

    saveCustomer() {
      if(this.loggedInEmployeeId){
        this.userService.addCustomer(this.newCustomer, this.loggedInEmployeeId).subscribe(
          response => {
            this.fetchUsers();
            this.fetchUserCount();
            this.toastr.success('Customer added successfully!', 'Success');
            this.closeAddCustomerModal();
          },
          error => {
            this.toastr.error('Error adding customer!', 'Error');
          }
        );
      
        this.newCustomer = {
          customerId: '',
          serviceConnectionNo: '',
          name: '',
          email: '',
          phone: '',
          address: '',
          startDate: '',
          unitsConsumption: 0 
        };
      }
    }
    


    showAddEmployeeModal: boolean = false;
    newEmployee: any = {
      employeeId: '',
      name: '',
      email: '',
      phone: '',
    };

    openAddEmployeeModal() {
      this.showAddEmployeeModal = true;
    }

    closeAddEmployeeModal() {
      console.log(3);
      this.showAddEmployeeModal = false;
      console.log(4);
    }

    saveEmployee() {
      console.log(this.newEmployee);
      this.employeeService.addEmployee(this.newEmployee, this.loggedInEmployeeId).subscribe(
        response => {
          this.fetchEmployees();
          this.fetchBillCount();
          this.toastr.success('Employee added successfully!', 'Success');
          this.closeAddEmployeeModal();
        },
        error => {
          this.toastr.error('Error adding Employee!', 'Error');
        }
      );
    
      this.newEmployee = {
        employeeId: '',
        name: '',
        email: '',
        phone: '',
      };
    }
    

    showBulkUploadModal = false;
    selectedFile: File | null = null;
    isUploading: boolean = false;


    openBulkUploadModal() {
      this.showBulkUploadModal = true;
    }

    closeBulkUploadModal() {
      this.showBulkUploadModal = false;
      this.selectedFile = null; 
    }

    previewData: any[] = [];
    previewHeaders: string[] = [];
    
    showCSVPreviewModal: boolean = false;

    handleFileInput(event: any): void {
      this.selectedFile = event.target.files[0];
    
      if (this.selectedFile && this.selectedFile.name.toLowerCase().endsWith(".csv")) {
        const reader = new FileReader();
    
        reader.onload = (e: any) => {
          const csvText = e.target.result as string;
    
          const result = Papa.parse(csvText, {
            header: true,
            skipEmptyLines: true
          });
    
          if (result.data && result.data.length > 0) {
            this.previewHeaders = Object.keys(result.data[0]);
            this.previewData = result.data.slice(0, 5); // Show first 5 rows
            this.showCSVPreviewModal = true;
          }
        };
    
        reader.readAsText(this.selectedFile);
      }
    }
    
    closeCSVPreviewModal(): void {
      this.showCSVPreviewModal = false;
    }
   

    bulkUpload() {
      if (!this.selectedFile) {
        this.toastr.warning("Please select a CSV file!", "Warning");
        return;
      }
      const fileName = this.selectedFile.name.toLowerCase();
      if (!fileName.endsWith(".csv")) {
        this.toastr.error("Invalid file type! Please upload a CSV file.", "Error");
        return;
      }
      const formData = new FormData();
      formData.append("file", this.selectedFile);
      this.closeBulkUploadModal();
      this.isUploading = true;
      this.userService.uploadCustomers(formData, this.loggedInEmployeeId).subscribe(
        (response: any) => {
          this.toastr.success(response.message || "File uploaded successfully!", "Success");
          this.fetchUsers();
          this.isUploading = false;
        },
        (error: any) => {
          this.isUploading = false;
    
          let errorMessage = "Error uploading file! Please try again.";
          if (error.error && error.error.message) {
            const backendMessage = error.error.message;
            if (backendMessage.includes("Duplicate entry")) {
              const match = backendMessage.match(/Duplicate entry '(.*?)'/);
              const duplicateEntry = match ? match[1] : "Unknown";
              errorMessage = `Customer ID '${duplicateEntry}' is already registered.`;
            } else if (backendMessage.includes("constraint")) {
              errorMessage = "Data integrity issue detected! Please check your file.";
            } else {
              errorMessage = backendMessage;
            }
          } else if (error.status === 400) {
            errorMessage = "Bad Request! Check your CSV format.";
          } else if (error.status === 413) {
            errorMessage = "File too large! Upload a smaller CSV.";
          } else if (error.status === 500) {
            errorMessage = "Internal Server Error! Please contact support.";
          }
    
          this.toastr.error(errorMessage, "Upload Failed");
        }
      );
    }
    
    
    
    customers: any[] = [];
    showEditCustomerModal: boolean = false;
    selectedCustomer: any = {};
    
    editUser(customer: any) {
      this.selectedCustomer = { ...customer }; 
      this.showEditCustomerModal = true;
    }
    
    updateCustomer() {
      if (this.loggedInEmployeeId) {
        this.userService.updateUser(this.selectedCustomer, this.loggedInEmployeeId).subscribe(
          (response) => {
            this.toastr.success("Employee updated successfully!");
            this.fetchUsers(); 
            this.showEditCustomerModal = false;
          },
          (error) => {
            this.toastr.error("Failed to update employee.");
          }
        );
      }
    }
    
      closeEditCustomerModal() {
        this.showEditCustomerModal = false;
      }

      editedemployees: any[] = [];
      showEditEmployeeModal: boolean = false;
      selectedEmployee: any = {};
    
      editEmployee(employee: any) {
        this.selectedEmployee = { ...employee }; 
        this.showEditEmployeeModal = true;
      }
  
      updateEmployee() {
        this.employeeService.updateEmployee(this.selectedEmployee, this.loggedInEmployeeId).subscribe(
          (response) => {
            this.toastr.success("Employee updated successfully!");
            this.fetchEmployees(); 
            this.showEditEmployeeModal = false;
          },
          (error) => {
            this.toastr.error("Failed to update employee.");
          }
        );
      }
      
  
    closeEditEmployeeModal() {
      this.showEditEmployeeModal = false;
    }

    deleteUser(user: any): void {
      if (this.loggedInEmployeeId && confirm(`Are you sure you want to delete ${user.name}?`)) {
        this.userService.deleteUser(user.id, this.loggedInEmployeeId).subscribe(
          () => {
            this.toastr.success('Customer deleted successfully!', 'Success');
            this.fetchUsers();
          },
          error => {
            this.toastr.error('Error deleting customer!', 'Error');
          }
        );
      }
    }

    deleteEmployee(employee: any): void {
      if (this.loggedInEmployeeId && confirm(`Are you sure you want to delete ${employee.name}?`)) {
        this.employeeService.deleteEmployee(employee.id,this.loggedInEmployeeId).subscribe(
          () => {
            this.fetchEmployees(); 
            this.toastr.success('User deleted successfully!', 'Success');
          },
          error => {
            this.toastr.error('Error deleting user!', 'Error');
          }
        );
      }
    }


    showInvoiceModal: boolean = false;
    serviceConnectionNumber: string = '';
    customer: any = {}; 
    unitsConsumed: number = 0;
    totalAmount: number = 0;
    billGeneratedDate: string = new Date().toISOString().split('T')[0]; 
    dueDate: string = '';
    totalConsumed: number = 0;

    fetchTotalConsumption() {
      if (this.serviceConnectionNumber) {
        this.userService.getTotalConsumption(this.serviceConnectionNumber).subscribe(
          (data) => {
            this.totalConsumed = data;
          },
          (error) => {
            console.error('Failed to fetch total consumption', error);
          }
        );
      }
    }

    openInvoiceModal() {
      this.showInvoiceModal = true;
      this.setBillDates();
    }
  
    closeInvoiceModal() {
      this.showInvoiceModal = false;
    }

    calculateTotalAmount() {
      if (this.selectedInvoice) { 
        this.selectedInvoice.totalAmount = this.selectedInvoice.unitsConsumed * 41.50;
      }
      const remainingUnits = this.unitsConsumed - this.totalConsumed;
      console.log(remainingUnits);
      this.totalAmount = remainingUnits * 41.50;
    }
  
    setBillDates() {
      const today = new Date();
      this.billGeneratedDate = today.toISOString().split('T')[0]; 
  
      const due = new Date();
      due.setDate(today.getDate() + 10);
      this.dueDate = due.toISOString().split('T')[0];
    }
  
    saveInvoice() {
      const invoiceData = {
        serviceConnectionNumber: this.serviceConnectionNumber,
        unitsConsumed: this.unitsConsumed,
        totalAmount: this.totalAmount,
        billGeneratedDate: this.billGeneratedDate,
        dueDate: this.dueDate
      };
    
      this.invoiceService.saveInvoice(invoiceData,this.loggedInEmployeeId).subscribe(
        (response) => {
          console.log('Invoice saved successfully:', response);
          this.toastr.success('Invoice saved successfully', 'Success');
          this.fetchUsers();
          this.fetchInvoices();
          this.resetForm();
          this.closeInvoiceModal(); 
        },
        (error) => {
          console.error('Error saving invoice:', error);
        
          if (error.error && typeof error.error === 'string') {
            if (error.error.includes('Invalid Service Connection Number')) {
              this.toastr.error('Invalid service connection number. Please check and try again.', 'Error');
            } else if (error.error.includes('Bill already generated')) {
              this.toastr.warning('Invoice already exists for this month.', 'Warning');
            } else {
              this.toastr.error(error.error, 'Error');
            }
          } else {
            this.toastr.error('Something went wrong while saving the invoice.', 'Error');
          }
        
          this.resetForm();
        }
      );
    }

    resetForm() {
      this.serviceConnectionNumber = '';
      this.unitsConsumed = 0;
      this.totalAmount = 0;
      this.totalConsumed=0;
      this.billGeneratedDate = new Date().toISOString().split('T')[0];
      this.dueDate = '';
    }

    invoices: Invoice[] = [];
    currentPage2: number = 0;
    itemsPerPage2: number = 4;
    totalPages2: number = 0;


    onFilterChange(): void {
      this.currentPage2 = 0;
      this.updateTotalPages2();
    }

    updateTotalPages2(): void {
      const filteredLength = this.filteredInvoices().length;
      this.totalPages2 = Math.ceil(filteredLength / this.itemsPerPage2);
      if (this.currentPage2 >= this.totalPages2) {
        this.currentPage2 = 0;
      }
    }

    fetchInvoices(): void {
      this.invoiceService.getInvoices().subscribe({
        next: (data) => {
          if (data && Array.isArray(data)) {
            this.invoices = data;
            console.log("Invoices fetched:", this.invoices);
            this.updateTotalPages2();
            this.totalPages2 = Math.ceil(this.invoices.length / this.itemsPerPage2);
          } else {
            console.error("Invalid API response:", data);
            this.invoices = []; 
          }
        },
        error: (error) => {
          console.error("Error fetching invoices:", error);
          this.invoices = []; 
        }
      });
    }

    selectedPaymentStatus: string = '';

    filteredInvoices() {
      return this.invoices.filter(invoice =>
        (
          invoice.id.toString().includes(this.searchQuery1) ||
          invoice.serviceConnectionNumber.toLowerCase().includes(this.searchQuery1.toLowerCase()) ||
          invoice.unitsConsumed.toString().includes(this.searchQuery1) ||
          invoice.totalAmount.toString().includes(this.searchQuery1) ||
          new Date(invoice.billGeneratedDate).toLocaleDateString().includes(this.searchQuery1) ||
          new Date(invoice.dueDate).toLocaleDateString().includes(this.searchQuery1) ||
          invoice.isPaid.toLowerCase().includes(this.searchQuery1.toLowerCase())
        ) &&
        (
          !this.selectedPaymentStatus || invoice.isPaid === this.selectedPaymentStatus
        )
      );
    }

    downloadFilteredInvoices() {
      const filtered = this.filteredInvoices();
      if (filtered.length === 0) {
        this.toastr.error('No records Found');
        return;
      }
      const doc = new jsPDF({ orientation: 'landscape' });
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const headerImg = 'assets/header.png';
      doc.addImage(headerImg, 'PNG', 10, 5, pageWidth - 20, 25);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.setTextColor(40, 40, 100);
      doc.text('Electricity Invoice Report', pageWidth / 2, 35, { align: 'center' });
      const headers = [['Invoice ID', 'Service Connection No', 'Units Consumed', 'Total Amount', 'Bill Date', 'Due Date', 'Payment Status']];
      const data = filtered.map(inv => [
        inv.id,
        inv.serviceConnectionNumber,
        inv.unitsConsumed,
        `${inv.totalAmount}`,
        new Date(inv.billGeneratedDate).toLocaleDateString(),
        new Date(inv.dueDate).toLocaleDateString(),
        inv.isPaid
      ]);
      autoTable(doc, {
        head: headers,
        body: data,
        startY: 45,
        styles: { fontSize: 10, cellPadding: 3 },
        headStyles: { fillColor: [40, 40, 100], textColor: 255, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [240, 240, 240] },
      });
      const footerImg = 'assets/footer.png';
      doc.addImage(footerImg, 'PNG', 10, pageHeight - 30, pageWidth - 20, 20);
      doc.save('Electricity_Invoice_Report.pdf');
    }
      
    getPaginatedInvoices() {
      const filtered = this.filteredInvoices();
      const startIndex = this.currentPage2 * this.itemsPerPage2;
      return filtered.slice(startIndex, startIndex + this.itemsPerPage2);
    }
  
    changePage2(page: number): void {
      if(this.totalPages2 === 0){
        this.currentPage2 = 0;
      }
      else if (page >= 0 && page < this.totalPages2) {
        this.currentPage2 = page;
      }
    }

    downloadUserPDF() {
      const doc = new jsPDF({ orientation: 'landscape' });
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const headerImg = 'assets/header.png';
      const footerImg = 'assets/footer.png';
      doc.addImage(headerImg, 'PNG', 10, 5, pageWidth - 20, 15);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.setTextColor(40, 40, 100);
      doc.text('Customer Data Report', pageWidth / 2, 30, { align: 'center' });
      if (this.users.length === 0) {
        doc.setFontSize(14);
        doc.setTextColor(200, 0, 0); // red color
        doc.text('There are no records to display.', pageWidth / 2, 50, { align: 'center' });
      } else {
        const headers = [['Customer ID', 'Service Conn No.', 'Name', 'Email', 'Phone', 'Address', 'Units', 'Start Date']];
        const data = this.users.map(user => [
          user.customerId,
          user.serviceConnectionNo,
          user.name,
          user.email,
          user.phone,
          user.address,
          user.unitsConsumption,
          user.startDate
        ]);
        autoTable(doc, {
          head: headers,
          body: data,
          startY: 35,
          styles: { fontSize: 10, cellPadding: 3 },
          headStyles: { fillColor: [0, 31, 115], textColor: 255, fontStyle: 'bold' },
          alternateRowStyles: { fillColor: [240, 240, 240] },
        });
      }
      doc.addImage(footerImg, 'PNG', 10, pageHeight - 30, pageWidth - 20, 15);
      doc.save('Customer_Data.pdf');
    }
    
    downloadEmployeePDF() {
      const doc = new jsPDF({ orientation: 'landscape' });
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const headerImg = 'assets/header.png'; 
      doc.addImage(headerImg, 'PNG', 10, 5, pageWidth - 20, 25); 
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.setTextColor(40, 40, 100);
      doc.text('Employee Data Report', pageWidth / 2, 35, { align: 'center' });
      const headers = [['Employee ID', 'Name', 'Email', 'Phone']];
      const data = this.employees.map(emp => [
        emp.employeeId, emp.name, emp.email, emp.phone
      ]);
    
      autoTable(doc, {
        head: headers,
        body: data,
        startY: 45, 
        styles: { fontSize: 10, cellPadding: 3 },
        headStyles: { fillColor: [40, 40, 100], textColor: 255, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [240, 240, 240] },
      });
      const footerImg = 'assets/footer.png'; 
      doc.addImage(footerImg, 'PNG', 10, pageHeight - 30, pageWidth - 20, 20); 
      doc.save('Employee_Data.pdf');
    }

    
    showEditInvoiceModal = false;
    selectedInvoice: any = {};
    enteredPassword: string = ''; 
    correctPassword: string = '1234'; 

    editInvoice(invoice: any) {

      const userPassword = prompt('Enter password to edit invoice:'); 
      if (userPassword === this.correctPassword) {
        this.selectedInvoice = { ...invoice }; 
        this.setBillDates();
        this.showEditInvoiceModal = true;
      } 
      else {
        this.showEditInvoiceModal = false;
        alert('Incorrect password! Access denied.');
      }
    }

    closeEditInvoiceModal() {
      this.showEditInvoiceModal = false;
    }

    updateInvoice() {
      console.log(this.selectedInvoice);
      this.invoiceService.updateInvoice(this.selectedInvoice,this.loggedInEmployeeId).subscribe(
        (response) => {
          this.toastr.success("Invoice updated successfully!");
          this.fetchInvoices();
          console.log(this.selectedInvoice);
          this.showEditInvoiceModal = false;
        },
        (error) => {
          this.toastr.error("Failed to update invoice.");
        }
      );
    } 
    
    downloadParticularInvoice(invoice: any) {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const headerImg = 'assets/header.png'; 
      doc.addImage(headerImg, 'PNG', 10, 5, pageWidth - 20, 15); 
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(20);
      doc.setTextColor(40, 40, 100);
      doc.text('INVOICE', pageWidth / 2, 35, { align: 'center' });
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text(`Invoice ID: ${invoice.id}`, 14, 45);
      doc.text(`Bill Date: ${new Date(invoice.billGeneratedDate).toLocaleDateString()}`, 14, 55);
      doc.text(`Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}`, 14, 65);
      doc.setDrawColor(0);
      doc.line(14, 70, pageWidth - 14, 70);
      doc.setFontSize(14);
      doc.setTextColor(0, 31, 115); 
      doc.text('Customer Details', 14, 80);  
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);  
      doc.text(`Service Connection No: ${invoice.serviceConnectionNumber}`, 14, 90);
      doc.setDrawColor(0);
      doc.line(14, 100, pageWidth - 14, 100);
      const tableColumn = ["Item", "Details"];
      const tableRows = [
        ["Units Consumed", invoice.unitsConsumed],
        ["Total Amount", invoice.totalAmount],
        ["Payment Status", invoice.isPaid],
      ];
      autoTable(doc,{
        startY: 105, 
        head: [tableColumn],
        body: tableRows,
        theme: 'grid',
        headStyles: {
          fillColor: [0, 31, 115], 
          textColor: [255, 255, 255], 
          fontSize: 12,
          fontStyle: 'bold',
          halign: 'center',
        },
        bodyStyles: {
          fontSize: 12,
          halign: 'left',
        },
        alternateRowStyles: {
          fillColor: [240, 240, 240],
        },
        margin: { top: 10, left: 14, right: 14 },
      });
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      const footerImg = 'assets/footer.png';
      doc.addImage(footerImg, 'PNG', 10, pageHeight - 30, pageWidth - 20, 20);
      doc.save(`Invoice_${invoice.id}.pdf`);
    }

    invoiceId!: string; 
    invoiceDetails!: any;
    paymentAmount!: number;
    discountType: string = '';

    fetchInvoiceDetails() {
      if (this.invoiceId) {
        this.invoiceService.getInvoiceDetails(this.invoiceId).subscribe(
          (data: any) => {
            this.invoiceDetails = data;
          },
          (error) => {
            console.error('Error fetching invoice details', error);
          }
        );
      }
    }

    showSuccessModal: boolean = false;
    lastTransactionResponse: any;

    submitPaymentForm() {
      const transaction = {
        invoice: { id: this.invoiceId },
        totalAmount: this.invoiceDetails?.totalAmount || 0,
        discountType: this.discountType,
        amountPaid: this.paymentAmount,
        paymentMethod: 'CASH',
        transactionStatus: 'SUCCESS',
      };
      this.transactionService.saveTransaction(transaction,this.loggedInEmployeeId).subscribe(
        (response) => {
          this.lastTransactionResponse = response;
          this.showSuccessModal = true;
        },
        (error) => {   
          this.toastr.error('Payment Failed! Please try again.', 'Error');
          console.error('Transaction Error:', error);
        }
      );
    }

    closeSuccessModal() {
      this.showSuccessModal = false;
      this.downloadPaymentBill(this.lastTransactionResponse);
      this.resetFormTransaction();
    }
  
    resetFormTransaction() {
        this.invoiceId = '';  
        this.totalAmount = 0;  
        this.discountType = '';  
        this.paymentAmount = 0;   
        window.location.reload();
    }
    

    downloadPaymentBill(transaction: any) {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      doc.setFillColor(63, 81, 181);
      doc.rect(0, 0, pageWidth, 40, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(22);
      doc.setTextColor(255, 255, 255);
      doc.text('Payment Receipt', pageWidth / 2, 25, { align: 'center' });
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.5);
      doc.line(20, 45, pageWidth - 20, 45);
      let yPosition = 55;
      const rowHeight = 12;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(13);
    
      const tableData = [
        { label: 'Invoice ID', value: String(transaction.invoice.id) },
        { label: 'Date', value: new Date(transaction.transactionDate).toLocaleDateString() },
        { label: 'Discount', value: transaction.discountType || 'None' },
        { label: 'Amount Paid', value: `${transaction.amountPaid.toFixed(2)}` },
        { label: 'Payment Method', value: transaction.paymentMethod },
        { label: 'Transaction Status', value: transaction.transactionStatus }
      ];
      const boxHeight = tableData.length * rowHeight + 10;
      doc.setDrawColor(220, 220, 220);
      doc.setFillColor(245, 245, 245);
      doc.roundedRect(15, yPosition - 10, pageWidth - 30, boxHeight, 4, 4, 'FD');
    
      tableData.forEach((row, index) => {
        const currentY = yPosition + index * rowHeight;
        doc.setTextColor(33, 37, 41); 
        doc.setFont('helvetica', 'bold');
        doc.text(`${row.label}:`, 25, currentY);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0, 0, 0);
        doc.text(row.value, pageWidth / 2, currentY, { align: 'center' });
      });
      yPosition += tableData.length * rowHeight + 20;
      const thankYouMessage = 'Thank you for your payment!';
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bolditalic');
      doc.setTextColor(40, 167, 69); 
      const messageWidth = doc.getStringUnitWidth(thankYouMessage) * 14 / doc.internal.scaleFactor;
      const messageX = (pageWidth - messageWidth) / 2;
      doc.text(thankYouMessage, messageX, yPosition);
      doc.setDrawColor(220, 220, 220);
      doc.line(20, pageHeight - 30, pageWidth - 20, pageHeight - 30);
      const footerText = 'For support, contact us at: support@company.com';
      doc.setFontSize(10);
      doc.setTextColor(120, 120, 120);
      const footerWidth = doc.getStringUnitWidth(footerText) * 10 / doc.internal.scaleFactor;
      const footerX = (pageWidth - footerWidth) / 2;
      doc.text(footerText, footerX, pageHeight - 20);
      doc.save(`Payment_Receipt_${transaction.invoice.id}.pdf`);
    }
    
    
    
    calculatePaymentAmount() {
      this.paymentService.calculatePayment(this.invoiceId, this.discountType)
        .subscribe(
          (amount) => {
            if (amount === null) {
              this.toastr.error('Invoice not found!', 'Error');
              return;
            }
            this.paymentAmount = amount;
            this.toastr.success(`Payment Amount: ₹${amount.toFixed(2)}`, 'Success');
          },
          (error) => {
            if (error.status === 404) {
              this.toastr.error('Invoice not found! Please check the Invoice ID.', 'Error');
            } else {
              this.toastr.error('Something went wrong while fetching payment amount.', 'Error');
            }
            console.error('Error fetching payment amount:', error);
          }
        );
    } 
    
    searchQuery2: string = '';
    currentPage3: number = 0;
    totalPages3: number = 1;
    transactions: Transaction[] = [];
    filteredTransactions: Transaction[] = [];

    changePage3(page: number) {
      if (page >= 0 && page < this.totalPages3) {
        this.currentPage3 = page;
      }
    }

    FilterTransactions(): void {
      let filtered = this.transactions.filter(transaction =>
        transaction.invoice.serviceConnectionNumber.includes(this.searchQuery2) ||
        transaction.transactionId.toString().includes(this.searchQuery2) ||
        transaction.invoice.id.toString().includes(this.searchQuery2) ||
        transaction.transactionStatus.toLowerCase().includes(this.searchQuery2.toLowerCase())
      );

      this.totalPages3 = Math.ceil(filtered.length / this.pageSize);
      this.filteredTransactions = filtered.slice(this.currentPage3 * this.pageSize, (this.currentPage3 + 1) * this.pageSize);
    }

    downloadTransactionPDF() {
      const doc = new jsPDF({ orientation: 'landscape' });
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const headerImg = 'assets/header.png';
      doc.addImage(headerImg, 'PNG', 10, 5, pageWidth - 20, 25);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.setTextColor(40, 40, 100);
      doc.text('Transaction Report', pageWidth / 2, 35, { align: 'center' });
      const headers = [[
        'Transaction ID',
        'Invoice ID',
        'Service Conn No',
        'Total Amount',
        'Discount Type',
        'Amount Paid',
        'Payment Method',
        'Status',
        'Date'
      ]];
      const data = this.transactions.map(tx => [
        tx.transactionId,
        tx.invoice.id,
        tx.invoice.serviceConnectionNumber,
        `${tx.totalAmount.toFixed(2)}`,
        tx.discountType,
        `${tx.amountPaid.toFixed(2)}`,
        tx.paymentMethod,
        tx.transactionStatus,
        tx.transactionDate 
      ]);
      autoTable(doc, {
        head: headers,
        body: data,
        startY: 45,
        styles: { fontSize: 10, cellPadding: 3 },
        headStyles: { fillColor: [0, 31, 115], textColor: 255, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [245, 245, 245] },
      });
      const footerImg = 'assets/footer.png';
      doc.addImage(footerImg, 'PNG', 10, pageHeight - 30, pageWidth - 20, 20);
      doc.save('Transaction_Report.pdf');
    }


    fetchTransactions(): void {
      this.transactionService.getAllTransactions().subscribe(
        (data) => {
          console.log(data);
          this.transactions = data;
          this.FilterTransactions();
        },
        (error) => {
          console.error('Error fetching transactions:', error);
        }
      );
    }

  helpRequests: any[] = [];
  loadHelpRequests(): void {
      console.log("Help");
      this.helpService.getAllHelpRequests().subscribe(
        (data) => {
          console.log(data);
          console.log('Fetched Help Requests:', data);
          this.helpRequests = data;
        },
        (error) => {
          console.error('Error fetching help requests:', error);
        }
      );
    }

  getStatusClass(status: string): string {
    switch (status) {
      case 'SENT':
        return 'status-sent';
      case 'RECEIVED':
        return 'status-received';
      case 'IN_PROGRESS':
        return 'status-in-progress';
      case 'COMPLETED':
        return 'status-completed';
      case 'DECLINED':
        return 'status-declined';
      default:
        return '';
    }
  }

  isModalOpen: boolean = false;
  selectedRequest: any = null;
  selectedStatus: string = '';

  openModal(request: any): void {
    this.selectedRequestId = request.id; 
    this.selectedRequest = request;
    this.selectedStatus = request.status; 
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.selectedRequest = null;
  }

  updateStatus() {
    if (!this.selectedRequestId) {  
      this.toastr.warning("No request selected!", "Warning"); 
      return;
    }
  
    if (!this.selectedStatus) {  
      this.toastr.warning("Please select a status!", "Warning"); 
      return;
    }

    console.log(this.selectedRequestId+" "+this.selectedStatus);
  
    this.helpService.updateHelpStatus(this.selectedRequestId, this.selectedStatus,this.loggedInEmployeeId).subscribe(
      (response) => {
        this.toastr.success("Status updated successfully!", "Success");
        this.closeModal();
        this.loadHelpRequests(); 
      },
      (error) => {
        console.error("Error updating status:", error);
        this.toastr.error("Failed to update status. Please try again!", "Error");
      }
    );
  }

}
  
