import { CategoriesService } from '../../services/categories.service';
import { Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { Category } from '../../../../core/models/categories.interface';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-popularCategories',
  templateUrl: './popularCategories.component.html',
  styleUrls: ['./popularCategories.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class PopularCategoriesComponent implements OnInit {
  @ViewChild('carouselContainer') carouselContainer!: ElementRef;
  
  private readonly categoriesService = inject(CategoriesService);
  
  // Carousel state
  currentIndex = 0;
  itemsPerView = 4;
  touchStartX = 0;
  touchEndX = 0;
  isDragging = false;
  dragStartX = 0;
  dragOffset = 0;
  
  // Update items per view based on screen size
  updateItemsPerView() {
    const width = window.innerWidth;
    if (width >= 1280) {
      this.itemsPerView = 5;
    } else if (width >= 1024) {
      this.itemsPerView = 4;
    } else if (width >= 768) {
      this.itemsPerView = 3;
    } else if (width >= 480) {
      this.itemsPerView = 2;
    } else {
      this.itemsPerView = 1;
    }
  }
  
  // Touch event handlers
  onTouchStart(event: TouchEvent) {
    this.touchStartX = event.touches[0].clientX;
  }

  onTouchMove(event: TouchEvent) {
    if (!this.touchStartX) return;
    this.touchEndX = event.touches[0].clientX;
    this.handleSwipe();
  }

  onTouchEnd() {
    this.touchStartX = 0;
    this.touchEndX = 0;
  }

  // Mouse event handlers
  onMouseDown(event: MouseEvent) {
    this.isDragging = true;
    this.dragStartX = event.clientX;
    event.preventDefault();
  }

  onMouseMove(event: MouseEvent) {
    if (!this.isDragging) return;
    
    const dragDistance = event.clientX - this.dragStartX;
    this.dragOffset = dragDistance;
    
    // Prevent text selection while dragging
    event.preventDefault();
  }

  onMouseUp() {
    this.isDragging = false;
    
    // If drag distance is significant, navigate
    if (Math.abs(this.dragOffset) > 50) {
      if (this.dragOffset > 0) {
        this.prev();
      } else {
        this.next();
      }
    }
    this.dragOffset = 0;
  }

  onMouseLeave() {
    this.isDragging = false;
    this.dragOffset = 0;
  }

  // Auto-scroll interval
  private autoScrollInterval: any;
  private readonly SCROLL_DELAY = 3000; // 3 seconds

  // Start auto-scrolling
  private startAutoScroll() {
    if (this.autoScrollInterval) {
      clearInterval(this.autoScrollInterval);
    }
    
    this.autoScrollInterval = setInterval(() => {
      this.next();
    }, this.SCROLL_DELAY);
  }

  // Navigation methods with infinite loop
  next() {
    if (this.categoriesList.length <= this.itemsPerView) return;
    
    // Calculate the next index with loop
    const nextIndex = this.currentIndex + 1;
    
    if (nextIndex > this.categoriesList.length - this.itemsPerView) {
      // If next would go beyond last item, smoothly transition to first
      this.currentIndex = 0;
    } else {
      this.currentIndex = nextIndex;
    }
    
    // Reset auto-scroll timer on navigation
    this.resetAutoScroll();
  }
  
  prev() {
    if (this.categoriesList.length <= this.itemsPerView) return;
    
    if (this.currentIndex <= 0) {
      // If at the start, go to the end
      this.currentIndex = Math.max(0, this.categoriesList.length - this.itemsPerView);
    } else {
      this.currentIndex--;
    }
  }
  
  private handleSwipe() {
    const swipeThreshold = 50;
    const swipeDistance = this.touchStartX - this.touchEndX;
    
    if (Math.abs(swipeDistance) > swipeThreshold) {
      if (swipeDistance > 0) {
        this.next();
      } else {
        this.prev();
      }
      this.touchStartX = this.touchEndX;
    }
  }
  
  // Go to specific slide with loop support
  goToSlide(index: number) {
    if (!this.categoriesList || !this.categoriesList.length) return;
    
    if (index < 0) {
      // If going before first slide, go to last slide
      this.currentIndex = Math.max(0, this.categoriesList.length - this.itemsPerView);
    } else if (index > this.categoriesList.length - this.itemsPerView) {
      // If going after last slide, go to first slide
      this.currentIndex = 0;
    } else {
      this.currentIndex = index;
    }
  }
  
  // Get visible dots for pagination
  getVisibleDots(): number[] {
    if (!this.categoriesList || this.categoriesList.length === 0) return [];
    const dotsCount = Math.ceil(this.categoriesList.length / this.itemsPerView);
    return Array.from({ length: dotsCount }, (_, i) => i);
  }

  // Calculate grid template columns
  getGridTemplateColumns(): string {
    if (!this.categoriesList || !this.categoriesList.length) return '';
    const itemCount = Math.min(this.itemsPerView, this.categoriesList.length);
    return `repeat(${this.categoriesList.length}, calc((100% - 6rem) / ${itemCount}))`;
  }

  // Calculate transform for sliding with smooth transition
  getTransform(): string {
    if (!this.categoriesList || !this.categoriesList.length) return '';
    
    const itemCount = Math.min(this.itemsPerView, this.categoriesList.length);
    const totalItems = this.categoriesList.length;
    
    // Calculate the position with smooth looping
    let position = this.currentIndex;
    
    // If we're at the last position, smoothly transition to first
    if (position >= totalItems - itemCount) {
      position = position % totalItems;
    }
    
    const percentage = (position / itemCount) * 100;
    const offset = position * 1.5;
    const dragOffset = this.isDragging ? this.dragOffset : 0;
    
    return `translateX(calc(-${percentage}% - ${offset}rem + ${dragOffset}px))`;
  }

  // Calculate grid auto columns
  getGridAutoColumns(): string {
    if (!this.categoriesList || !this.categoriesList.length) return '';
    const itemCount = Math.min(this.itemsPerView, this.categoriesList.length);
    return `calc((100% - 6rem) / ${itemCount})`;
  }
  
  categoriesList: Category[] = [];
  
  // Image error handler
  onImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    console.log('Image failed to load:', img.src);
    img.src = 'assets/images/placeholder.jpg'; // Fallback image
  }
  
  // Image load handler
  onImageLoad(event: Event) {
    const img = event.target as HTMLImageElement;
    console.log('Image loaded successfully:', img.src);
  }

  constructor() { }

  ngOnInit(): void {
    this.updateItemsPerView();
    this.loadCategories();
    
    // Start auto-scroll when component initializes
    this.startAutoScroll();
    
    // Add window resize listener
    window.addEventListener('resize', this.onResize);
  }
  
  ngOnDestroy() {
    // Clean up
    if (this.autoScrollInterval) {
      clearInterval(this.autoScrollInterval);
    }
    window.removeEventListener('resize', this.onResize);
  }
  
  // Handle window resize
  private onResize = () => {
    this.updateItemsPerView();
    this.resetAutoScroll();
  };
  
  // Reset auto-scroll timer
  private resetAutoScroll() {
    if (this.autoScrollInterval) {
      clearInterval(this.autoScrollInterval);
      this.startAutoScroll();
    }
  }

  loadCategories() {
    this.categoriesService.getAllCategories().subscribe({
      next: (response) => {
        // Assuming the response has a 'data' property that contains the categories array
        this.categoriesList = response.data || [];
      },
      error: (error: any) => {
        console.error('Error fetching categories:', error);
      }
    });
  }
}
