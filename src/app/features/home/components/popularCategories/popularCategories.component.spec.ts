import { Component, OnInit, HostListener } from '@angular/core';

@Component({
  selector: 'app-popular-categories',
  templateUrl: './popularCategories.component.html',
  styleUrls: ['./popularCategories.component.css']
})
export class PopularCategoriesComponent implements OnInit {

  categoriesList = [
    { _id: '1', name: 'Electronics', image: 'assets/images/electronics.jpg' },
    { _id: '2', name: 'Fashion', image: 'assets/images/fashion.jpg' },
    { _id: '3', name: 'Home & Kitchen', image: 'assets/images/home.jpg' },
    { _id: '4', name: 'Sports', image: 'assets/images/sports.jpg' },
    { _id: '5', name: 'Books', image: 'assets/images/books.jpg' },
  ];

  currentIndex = 0;
  itemsPerView = 4;
  isDragging = false;
  startX = 0;
  currentTranslate = 0;
  prevTranslate = 0;

  ngOnInit() {
    setInterval(() => {
      this.goToSlide(this.currentIndex + 1);
    }, 3000);
  }

  goToSlide(index: number) {
    const totalItems = this.categoriesList.length;

    this.currentIndex = index;

    if (this.currentIndex >= totalItems * 2) {
      this.currentIndex = totalItems;
    }

    if (this.currentIndex < 0) {
      this.currentIndex = totalItems;
    }
  }

  getTransform() {
    return `translateX(-${this.currentIndex * (100 / this.itemsPerView)}%)`;
  }

  getGridTemplateColumns() {
    return `repeat(${this.categoriesList.length * 2}, minmax(0, 1fr))`;
  }

  getGridAutoColumns() {
    return `calc(100% / ${this.itemsPerView})`;
  }

  getVisibleDots() {
    return Array(Math.ceil(this.categoriesList.length / this.itemsPerView)).fill(0);
  }

  onTouchStart(event: TouchEvent) {
    this.isDragging = true;
    this.startX = event.touches[0].clientX;
  }

  onTouchMove(event: TouchEvent) {
    if (!this.isDragging) return;
    const currentX = event.touches[0].clientX;
    const diff = currentX - this.startX;
    this.currentTranslate = this.prevTranslate + diff;
  }

  onTouchEnd() {
    this.isDragging = false;
    this.prevTranslate = this.currentTranslate;
  }

  onMouseDown(event: MouseEvent) {
    this.isDragging = true;
    this.startX = event.clientX;
  }

  onMouseMove(event: MouseEvent) {
    if (!this.isDragging) return;
    const currentX = event.clientX;
    const diff = currentX - this.startX;
    this.currentTranslate = this.prevTranslate + diff;
  }

  onMouseUp() {
    this.isDragging = false;
    this.prevTranslate = this.currentTranslate;
  }

  onMouseLeave() {
    if (this.isDragging) {
      this.isDragging = false;
      this.prevTranslate = this.currentTranslate;
    }
  }

  onImageError(event: any) {
    event.target.src = 'assets/images/fallback.jpg';
  }

  onImageLoad(event: any) {
  }
}
