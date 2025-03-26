import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Chart } from 'chart.js/auto';
import { UserService } from '../../services/user.service';
import { ToastrService } from 'ngx-toastr';

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

  constructor(private userService: UserService,private toastr: ToastrService,) {}

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
  searchQuery: string = '';
  currentPage: number = 0;
  pageSize: number = 5;



  ngOnInit() {
    this.fetchUsers();
  }

  fetchUsers() {
    this.userService.getUsers().subscribe(data => {
      this.users = data;
    });
  }

  filteredUsers() {
    return this.users.filter(user =>
      user.customerId.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      user.serviceConnectionNo.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      user.phone.includes(this.searchQuery) ||
      user.address.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      user.unitsConsumption.toString().includes(this.searchQuery) ||
      user.startDate.toLowerCase().includes(this.searchQuery.toLowerCase())
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

  get totalPages() {
    return Math.ceil(this.filteredUsers().length / this.pageSize);
  }

  showAddCustomerModal: boolean = false;
  newCustomer: any = {
    customerId: '',
    serviceConnectionNo: '',
    email: '',
    phone: '',
    address: '',
    startDate: '',
    unitsConsumption: 0 // Default to 0
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

    const formData = new FormData();
    formData.append("file", this.selectedFile);

    this.userService.uploadCustomers(formData).subscribe(
      (response: any) => {
        if (response.message.includes("skipped")) {
          this.toastr.warning(response.message, "Partial Success");
        } else {
          this.fetchUsers();
          this.toastr.success(response.message, "Success");
        }
        this.closeBulkUploadModal();
      },
      (error: any) => {
        // ✅ Check if backend returned a JSON response with a message
        const errorMessage = error.error?.message || "Error uploading file!";
        this.toastr.error(errorMessage, "Error");
      }
    );      
  }

  editUser(user: any) {
    alert(`Editing: ${user.name}`);
  }

  deleteUser(user: any) {
    const confirmDelete = confirm(`Are you sure you want to delete ${user.name}?`);
    if (confirmDelete) {
      this.users = this.users.filter(u => u !== user);
    }
  }
}
