import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Product } from '../../models/product';
import { ProductCardComponent } from '../product-cards/product-cards.component';
import { SharingDataService } from '../../services/sharing-data.service';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [ProductCardComponent],
  templateUrl: './catalog.component.html',
})
export class CatalogComponent implements OnInit{
  products!: Product[];
  
  constructor(
    private shareDataService: SharingDataService,
    private productService: ProductService) {}

  ngOnInit(): void {
    if(!this.products) {
      this.products = this.productService.findAll();
    }
  }

  onAddCart(product: Product){
    this.shareDataService.productEventEmitter.emit(product);
  }

}
