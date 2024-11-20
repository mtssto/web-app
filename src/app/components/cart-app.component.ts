import { Component, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { ProductService } from '../services/product.service';
import { CartItem } from '../models/cartItem';
import { NavbarComponent } from './navbar/navbar.component';
import { Router, RouterOutlet } from '@angular/router';
import { SharingDataService } from '../services/sharing-data.service';
import Swal from 'sweetalert2';
import { ItemsState } from '../store/item.reducer';
import { Store } from '@ngrx/store';
import { add, remove, total } from '../store/item.action';

@Component({
  selector: 'cart-app',
  standalone: true,
  imports: [NavbarComponent, RouterOutlet],
  templateUrl: './cart-app.component.html',
})
export class CartAppComponent implements OnInit{


  items: CartItem[] = [];

  total: number = 0;
  
  constructor(private service: ProductService,  
    private shareDataService: SharingDataService,
    private router: Router,
     private store: Store<{items: ItemsState}>) {
      this.store.select('items').subscribe(state => {
        this.items = state.items,
        this.total = state.total
      });
     }


  ngOnInit(): void {
  this.onDeleteCart();
  this.onAddCart();
  }

  onAddCart(): void {
    this.shareDataService.productEventEmitter.subscribe(
      product =>{
        this.store.dispatch(add({product}));
        this.store.dispatch(total())  
        this.saveSession();

        this.router.navigate(['/cart'], {
              state: {
                items: this.items, total: this.total
              }
        });

        Swal.fire({
          title: "Shopping",
          text: "Nuevo producto agregado al carro",
          icon: "success"
        });
       
      });

   
    
  }

  onDeleteCart(): void {
    this.shareDataService.idProductEventEmitter.subscribe(id => {

      const swalWithBootstrapButtons = Swal.mixin({
        customClass: {
          confirmButton: "btn btn-success",
          cancelButton: "btn btn-danger"
        },
        buttonsStyling: false
      });
      swalWithBootstrapButtons.fire({
        title: "Estas seguro que desea eliminar?",
        text: "Esto es irreversible",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Si, eliminar del carro",
        cancelButtonText: "No, mantener en el carro",
        reverseButtons: true
      }).then((result) => {
        if (result.isConfirmed) {
          if(this.items.length === 0){
            sessionStorage.removeItem('cart');
            sessionStorage.clear();
          }
          this.store.dispatch(remove({id}));
          this.store.dispatch(total())  
          this.saveSession();
    
          this.router.navigateByUrl('/', {skipLocationChange: true}).then(
            ()=> {
              this.router.navigate(['/cart'], {
                state: {
                  items: this.items, total: this.total
                }
              });
            }
          )
          swalWithBootstrapButtons.fire({
            title: "Eliminado",
            text: "Tu producto se elimino del carro",
            icon: "success"
          });
        } else if (
          result.dismiss === Swal.DismissReason.cancel
        ) {
          swalWithBootstrapButtons.fire({
            title: "Cancelled",
            text: "Your imaginary file is safe :)",
            icon: "error"
          });
        }
      });
    })
  }

  calculateTotal(): void{
    this.saveSession();
  }

  saveSession(): void {
    sessionStorage.setItem('cart', JSON.stringify(this.items))
  }
}
