import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Chart } from 'chart.js/auto';

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

  constructor() {}

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
  searchQuery: string = '';
  currentPage: number = 0;
  pageSize: number = 5;

  users = [
    { 
      customerId: 'C001', 
      serviceConnectionNo: 'SC001', 
      email: 'op1@wimerasys.com', 
      phone: '1234567890', 
      address: '123 Main St, City', 
      unitsConsumption: 120, 
      startDate: '2021-01-01' 
    },
    { 
      customerId: 'C002', 
      serviceConnectionNo: 'SC002', 
      email: 'supervisor1@wimerasys.com', 
      phone: '0987654321', 
      address: '456 Another St, City', 
      unitsConsumption: 250, 
      startDate: '2020-05-15' 
    },
    { 
      customerId: 'C003', 
      serviceConnectionNo: 'SC003', 
      email: 'op2@wimerasys.com', 
      phone: '1122334455', 
      address: '789 Some St, City', 
      unitsConsumption: 95, 
      startDate: '2022-08-20' 
    },
    { 
      customerId: 'C004', 
      serviceConnectionNo: 'SC004', 
      email: 'op3@wimerasys.com', 
      phone: '6677889900', 
      address: '1010 New St, City', 
      unitsConsumption: 180, 
      startDate: '2023-02-10' 
    },
    { 
      customerId: 'C005', 
      serviceConnectionNo: 'SC005', 
      email: 'op4@wimerasys.com', 
      phone: '9988776655', 
      address: '1234 Park St, City', 
      unitsConsumption: 150, 
      startDate: '2023-05-12' 
    },
    { 
      customerId: 'C006', 
      serviceConnectionNo: 'SC006', 
      email: 'op5@wimerasys.com', 
      phone: '2233445566', 
      address: '5678 Elm St, City', 
      unitsConsumption: 200, 
      startDate: '2023-07-08' 
    },
    { 
      customerId: 'C007', 
      serviceConnectionNo: 'SC007', 
      email: 'op6@wimerasys.com', 
      phone: '1122336677', 
      address: '8765 Maple St, City', 
      unitsConsumption: 130, 
      startDate: '2022-06-14' 
    },
    { 
      customerId: 'C008', 
      serviceConnectionNo: 'SC008', 
      email: 'op7@wimerasys.com', 
      phone: '4455667788', 
      address: '4321 Oak St, City', 
      unitsConsumption: 210, 
      startDate: '2021-11-23' 
    },
    { 
      customerId: 'C009', 
      serviceConnectionNo: 'SC009', 
      email: 'op8@wimerasys.com', 
      phone: '5566778899', 
      address: '6789 Pine St, City', 
      unitsConsumption: 140, 
      startDate: '2020-09-18' 
    },
    { 
      customerId: 'C010', 
      serviceConnectionNo: 'SC010', 
      email: 'op9@wimerasys.com', 
      phone: '6677889900', 
      address: '1010 Birch St, City', 
      unitsConsumption: 160, 
      startDate: '2019-10-05' 
    }
  ];

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

  addEmployee() {
    alert('Add Employee Clicked!');
  }

  bulkUpload() {
    alert('Bulk Upload Clicked!');
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
