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

  @Component({
    selector: 'app-dashboard',
    imports: [CommonModule,FormsModule],
    templateUrl: './dashboard.component.html',
    styleUrl: './dashboard.component.css'
  })
  export class DashboardComponent {

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
    

    constructor(private userService: UserService,private toastr: ToastrService,private employeeService: EmployeeService,private invoiceService: InvoiceService) {}

    showHome() {
      this.activeTab = 'home';
    }

    logout() {
      console.log('User logged out');
      // Handle logout logic here
    }

    users: any[] = [];
    employees: any[] = [];
    searchQuery: string = '';
    currentPage: number = 0;
    pageSize: number = 5;

    searchQuery1: string = '';
    currentPage1: number = 0;
    pageSize1: number = 5;



    ngOnInit() {
      this.fetchUsers();
      this.fetchEmployees();
      this.fetchInvoices();
      this.fetchBillCount();
      this.setBillDates();
      this.fetchUserCount();
    }

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
          console.log(1);
          this.closeAddEmployeeModal();
          console.log(2);
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
      this.selectedFile = null; // Reset file selection
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
      console.log("Uploading file:", this.selectedFile.name); // ✅ Debugging
    
      this.userService.uploadCustomers(formData).subscribe(
        (response: any) => {
          console.log("Upload Success:", response); // ✅ Debugging
          this.toastr.success(response.message, "Success");
          this.fetchUsers();
          this.closeBulkUploadModal();
        },
        (error: any) => {
          console.error("Upload Error:", error); // ✅ Debugging
          this.toastr.error("Error uploading file!");
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
    customer: any = {}; // Stores fetched customer details
    unitsConsumed: number = 0;
    totalAmount: number = 0;
    billGeneratedDate: string = new Date().toISOString().split('T')[0]; // Current date
    dueDate: string = '';


    openInvoiceModal() {
      this.showInvoiceModal = true;
      this.setBillDates();
    }
  
    closeInvoiceModal() {
      this.showInvoiceModal = false;
    }

    calculateTotalAmount() {
      this.totalAmount = this.unitsConsumed * 41.50;
    }
  
    setBillDates() {
      const today = new Date();
      this.billGeneratedDate = today.toISOString().split('T')[0]; // YYYY-MM-DD format
  
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
      this.billGeneratedDate = new Date().toISOString().split('T')[0];
      this.dueDate = '';
    }


    editInvoice() {
      console.log('Edit Invoice:');
      // Implement edit logic
    }

    deleteInvoice() {
      console.log('Delete Invoice:');
      // Implement delete logic
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
      const headerImg = 'assets/header.png'; // Replace with actual path
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
      const footerImg = 'assets/footer.png'; // Replace with actual path
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
    
  }
  
