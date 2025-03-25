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
}
