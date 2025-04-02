import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
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

  @Component({
    selector: 'app-dashboard',
    imports: [CommonModule,FormsModule],
    templateUrl: './dashboard.component.html',
    styleUrl: './dashboard.component.css'
  })
  export class DashboardComponent {

    constructor(private userService: UserService,private toastr: ToastrService,private employeeService: EmployeeService,private invoiceService: InvoiceService,private paymentService: PaymentService,private transactionService: TransactionService,private router: Router) {}

    ngOnInit() {
      this.fetchUsers();
      this.fetchEmployees();
      this.fetchInvoices();
      this.fetchBillCount();
      this.setBillDates();
      this.fetchUserCount();
      this.fetchTransactions();
    }

    activeTab: string = 'home'; 
    homeData = { users: 0 , bills: 0};
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
    
    showHome() {
      this.activeTab = 'home';
    }

    logout() {
      const confirmLogout = window.confirm('Are you sure you want to log out?');
      if (confirmLogout) {
        console.log('User logged out');
        localStorage.removeItem('authToken'); 
        sessionStorage.removeItem('authToken'); 
        this.router.navigate(['/login']);
      }
    }
    
    users: any[] = [];
    employees: any[] = [];
    searchQuery: string = '';
    currentPage: number = 0;
    pageSize: number = 5;
    searchQuery1: string = '';
    currentPage1: number = 0;
    pageSize1: number = 5;

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
      if (page >= 0 && page < this.totalPages) {
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
      this.userService.addCustomer(this.newCustomer).subscribe(
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
      this.newCustomer= {
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
      this.employeeService.addEmployee(this.newEmployee).subscribe(
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
      this.newEmployee= {
        employeeId: '',
        name: '',
        email: '',
        phone: '',
      };
    }

    showBulkUploadModal = false;
    selectedFile: File | null = null;

    openBulkUploadModal() {
      this.showBulkUploadModal = true;
    }

    closeBulkUploadModal() {
      this.showBulkUploadModal = false;
      this.selectedFile = null; 
    }

    handleFileInput(event: any) {
      this.selectedFile = event.target.files[0];
    }

    bulkUpload() {
      if (!this.selectedFile) {
        this.toastr.warning("Please select a CSV file!", "Warning");
        return;
      }
    
      const fileName = this.selectedFile.name.toLowerCase();
      if (!fileName.endsWith(".csv")) {
        console.log("Invalid file type detected!");
        this.toastr.error("Invalid file type! Please upload a CSV file.", "Error");
        return;
      }
    
      const formData = new FormData();
      formData.append("file", this.selectedFile);
      console.log("Uploading file:", this.selectedFile.name); 
    
      this.userService.uploadCustomers(formData).subscribe(
        (response: any) => {
          console.log("Upload Success:", response); 
          this.toastr.success(response.message || "File uploaded successfully!", "Success");
          this.fetchUsers();
          this.closeBulkUploadModal();
        },
        (error: any) => {
          console.error("Upload Error:", error); 
          let errorMessage = "Error uploading file! Please try again.";
          if (error.error && error.error.message) {
            const backendMessage = error.error.message;
            if (backendMessage.includes("Duplicate entry")) {
              const match = backendMessage.match(/Duplicate entry '(.*?)'/);
              const duplicateEntry = match ? match[1] : "Unknown";
              errorMessage = `Customer ID '${duplicateEntry}' is already registered. Please check your file for duplicates before uploading.`;
            } else if (backendMessage.includes("constraint")) {
              errorMessage = "Data integrity issue detected! Please check that the CSV file does not contain conflicting or missing values.";
            } else {
              errorMessage = backendMessage; 
            }
          } else if (error.status === 400) {
            errorMessage = "Bad Request! Please check your CSV format.";
          } else if (error.status === 413) {
            errorMessage = "File too large! Please upload a smaller CSV file.";
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
      this.selectedCustomer = { ...customer }; // Clone object
      this.showEditCustomerModal = true;
    }
    
      updateCustomer() {
        this.userService.updateUser(this.selectedCustomer).subscribe(
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
      this.employeeService.updateEmployee(this.selectedEmployee).subscribe(
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
      if (confirm(`Are you sure you want to delete ${user.name}?`)) {
        this.userService.deleteUser(user.id).subscribe(
          () => {
            this.fetchUsers(); 
            this.toastr.success('User deleted successfully!', 'Success');
          },
          error => {
            this.toastr.error('Error deleting user!', 'Error');
          }
        );
      }
    }

    deleteEmployee(employee: any): void {
      if (confirm(`Are you sure you want to delete ${employee.name}?`)) {
        this.employeeService.deleteEmployee(employee.id).subscribe(
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
    
      this.invoiceService.saveInvoice(invoiceData).subscribe(
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
          this.toastr.error('Error saving invoice', 'Error');
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
    itemsPerPage2: number = 5;
    totalPages2: number = 0;

    fetchInvoices(): void {
      this.invoiceService.getInvoices().subscribe({
        next: (data) => {
          if (data && Array.isArray(data)) {
            this.invoices = data;
            console.log("Invoices fetched:", this.invoices);
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

    filteredInvoices() {
      return this.invoices.filter(invoice =>
        invoice.id.toString().includes(this.searchQuery1) ||
        invoice.serviceConnectionNumber.toLowerCase().includes(this.searchQuery1.toLowerCase()) ||
        invoice.unitsConsumed.toString().includes(this.searchQuery1) ||
        invoice.totalAmount.toString().includes(this.searchQuery1) ||
        new Date(invoice.billGeneratedDate).toLocaleDateString().includes(this.searchQuery1) ||
        new Date(invoice.dueDate).toLocaleDateString().includes(this.searchQuery1) ||
        invoice.isPaid.toLowerCase().includes(this.searchQuery1.toLowerCase())
      );
    }
     
    getPaginatedInvoices() {
      const filtered = this.filteredInvoices();
      const startIndex = this.currentPage2 * this.itemsPerPage2;
      return filtered.slice(startIndex, startIndex + this.itemsPerPage2);
    }
  
    changePage2(page: number): void {
      if (page >= 0 && page < this.totalPages2) {
        this.currentPage2 = page;
      }
    }

    downloadUserPDF() {
      const doc = new jsPDF({ orientation: 'landscape' });
      const pageWidth = doc.internal.pageSize.getWidth();
      const headerImg = 'assets/header.png'; 
      doc.addImage(headerImg, 'PNG', 10, 5, pageWidth - 20, 15);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.setTextColor(40, 40, 100);
      doc.text('Customer Data Report', pageWidth / 2, 30, { align: 'center' });
      const headers = [['Customer ID', 'Service Conn No.', 'Name', 'Email', 'Phone', 'Address', 'Units', 'Start Date']];
      const data = this.users.map(user => [
        user.customerId, user.serviceConnectionNo, user.name, user.email, user.phone, user.address, user.unitsConsumption, user.startDate
      ]);
      autoTable(doc, {
        head: headers,
        body: data,
        startY: 35,
        styles: { fontSize: 10, cellPadding: 3 },
        headStyles: { fillColor: [40, 40, 100], textColor: 255, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [240, 240, 240] },
      });
      const footerImg = 'assets/footer.png'; 
      const pageHeight = doc.internal.pageSize.getHeight();
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

    downloadInvoicePDF() {
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
      const data = this.invoices.map(inv => [
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
      this.invoiceService.updateInvoice(this.selectedInvoice).subscribe(
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
      doc.setTextColor(0, 102, 204); 
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
          fillColor: [0, 102, 204], 
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
      this.transactionService.saveTransaction(transaction).subscribe(
        (response) => {
          this.lastTransactionResponse = response;
          this.showSuccessModal = true;
        },
        (error) => {   
          this.toastr.error('Payment Failed! Please try again.', 'Error');
          this.resetFormTransaction();
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
      doc.setFillColor(240, 240, 240);
      doc.rect(0, 0, pageWidth, pageHeight, 'F');
      const logoImg = 'assets/1.png'; 
      doc.addImage(logoImg, 'PNG', 10, 10, 50, 20);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(24);
      doc.setTextColor(0, 102, 204);
      doc.text('Payment Receipt', pageWidth / 2, 40, { align: 'center' });
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      const amountPaid = (transaction.amountPaid && !isNaN(transaction.amountPaid)) ? transaction.amountPaid.toFixed(2) : '0.00';
      let lineHeight = 10;
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text(`Invoice ID: ${transaction.invoice.id}`, 20, 60 + lineHeight);
      lineHeight += 7;
      doc.text(`Date: ${new Date(transaction.transactionDate).toLocaleDateString()}`, 20, 60 + lineHeight);
      lineHeight += 7;
      doc.text(`Discount: ${transaction.discountType ? transaction.discountType : 'None'}`, 20, 60 + lineHeight);
      lineHeight += 7;
      doc.text(`Amount Paid: $${amountPaid}`, 20, 60 + lineHeight);
      lineHeight += 7;
      doc.text(`Payment Method: ${transaction.paymentMethod}`, 20, 60 + lineHeight);
      lineHeight += 7;
      doc.text(`Transaction Status: ${transaction.transactionStatus}`, 20, 60 + lineHeight);
      lineHeight += 10;
      doc.setDrawColor(0, 102, 204);
      doc.line(20, 60 + lineHeight, pageWidth - 20, 60 + lineHeight);
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0); 
      doc.text('Thank you for your payment. If you have any questions, contact our support.', 20, 70 + lineHeight);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(128, 128, 128);
      const footerImg = 'assets/footer.png'; 
      doc.addImage(footerImg, 'PNG', 10, pageHeight - 40, pageWidth - 20, 20);
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
      console.log('Downloading transaction PDF...');
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
}
  
