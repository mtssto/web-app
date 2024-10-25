import { Component, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { ProductService } from '../services/product.service';
import { CartItem } from '../models/cartItem';
import { NavbarComponent } from './navbar/navbar.component';
import { Router, RouterOutlet } from '@angular/router';
import { SharingDataService } from '../services/sharing-data.service';
import Swal from 'sweetalert2';

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
    private router: Router) {}


  ngOnInit(): void {
  this.items = JSON.parse(sessionStorage.getItem('cart') || '[]') ; 
  this.calculateTotal();
  this.onDeleteCart();
  this.onAddCart();
  }

  onAddCart(): void {
    this.shareDataService.productEventEmitter.subscribe(
      product =>{
        const hasItem = this.items.find(item => item.product.id === product.id);
        if(hasItem){
          this.items = this.items.map(item => {
            if(item.product.id === product.id){
              return {
                ...item, quantity: item.quantity +1
              }
            }
            return item;
          }
          );
        } else{
          this.items = [... this.items, { product: {... product}, quantity: 1}]
        }
        this.calculateTotal();
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
          this.items = this.items.filter(
            item => item.product.id !== id
          );
          if(this.items.length === 0){
            sessionStorage.removeItem('cart');
            sessionStorage.clear();
          }
          this.calculateTotal();
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
    this.total = this.items.reduce(
      (accumulator, item) => accumulator + item.quantity * item.product.price, 0 
    )
    this.saveSession();
  }

  saveSession(): void {
    sessionStorage.setItem('cart', JSON.stringify(this.items))
  }
}
