import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Chart } from 'chart.js/auto';
import { UserService } from '../../services/user.service';
import { ToastrService } from 'ngx-toastr';
import { EmployeeService } from '../../services/employee.service';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule,FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements AfterViewInit  {
  activeTab: string = 'home'; 
  homeData = {
    users: 120,
    bills: 45,
    amountReceived: 2400
  };

  hourlyData = [100, 200, 150, 300, 250, 180, 220, 170, 90, 110, 200, 310]; // Sample hourly earnings data

  constructor(private userService: UserService,private toastr: ToastrService,private employeeService: EmployeeService) {}

  showHome() {
    this.activeTab = 'home';
    setTimeout(() => this.loadChart(), 100); // Ensure DOM is ready
  }


  logout() {
    console.log('User logged out');
    // Handle logout logic here
  }


  @ViewChild('amountChart') chartRef!: ElementRef;
  chart!: Chart;
  selectedMetric: string = 'amountReceived';
  isChartGenerated = false;

  chartData : any = {
    amountReceived: [100, 200, 150, 300, 250],
    transactionRate: [5, 8, 10, 7, 12],
    billsGenerated: [2, 5, 7, 6, 9]
  };

  labels = ['10 AM', '11 AM', '12 PM', '1 PM', '2 PM'];

  ngAfterViewInit() {
    this.loadChart();
  }

  loadChart() {
    if (this.chart) {
      this.chart.destroy(); // Destroy existing chart before creating a new one
    }
    this.chart = new Chart(this.chartRef.nativeElement, {
      type: 'bar',
      data: {
        labels: this.labels,
        datasets: [{
          label: this.selectedMetric,
          data: this.chartData[this.selectedMetric],
          backgroundColor: ['#f00', '#f80', '#ff0', '#0f0', '#00f']
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: true }
        }
      }
    });
  }

  updateChart() {
    this.isChartGenerated=true;
    this.loadChart();
  }

  downloadChart() {
    const a = document.createElement('a');
    a.href = this.chart.toBase64Image();
    a.download = 'chart.png';
    a.click();
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
        this.toastr.error(error.error?.message || "Error uploading file!", "Error");
      }
    );
  }
  

  customers: any[] = [];
  showEditCustomerModal: boolean = false;
  selectedCustomer: any = {};
  
    // Open Edit Modal
    editUser(customer: any) {
      this.selectedCustomer = { ...customer }; // Clone object
      this.showEditCustomerModal = true;
    }
  
    // Update Employee
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
            this.toastr.success('User deleted successfully!', 'Success');
            this.fetchUsers(); 
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
            this.toastr.success('User deleted successfully!', 'Success');
            this.fetchEmployees(); 
          },
          error => {
            this.toastr.error('Error deleting user!', 'Error');
          }
        );
      }
    }
}
