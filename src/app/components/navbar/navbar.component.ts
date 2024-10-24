import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CartItem } from '../../models/cartItem';

@Component({
  selector: 'navbar',
  standalone: true,
  imports: [],
  templateUrl: './navbar.component.html',
})
export class NavbarComponent {

  @Output() showCartEventEmitter = new EventEmitter();
  @Input() items: CartItem[] = [];

  openCart(): void {
    this.showCartEventEmitter.emit();
  }

}
