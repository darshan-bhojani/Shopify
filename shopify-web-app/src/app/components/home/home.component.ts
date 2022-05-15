import { Component, OnInit, AfterViewInit, ViewChild, Inject } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { InventoryService } from '../../services/inventory.service';
import { SelectionModel } from '@angular/cdk/collections';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { DomSanitizer } from '@angular/platform-browser';
import { MatIconRegistry } from '@angular/material/icon';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTable } from '@angular/material/table';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class HomeComponent implements OnInit, AfterViewInit {

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatTable) table: MatTable<Inventory>;

  inventoryData: MatTableDataSource<Inventory>;
  expandedElement: Inventory | null;
  warehouseData: any;
  render_table: boolean = true;

  constructor(private inventoryService: InventoryService, iconRegistry: MatIconRegistry, sanitizer: DomSanitizer, public dialog: MatDialog) {
    iconRegistry.addSvgIconLiteral('edit', sanitizer.bypassSecurityTrustHtml("./assets/img/edit.svg"));
    // this.render_table = false;
    this.inventoryService.getWholeInventoryData().subscribe((data: any) => {
      this.warehouseData = data.items
      this.inventoryData = new MatTableDataSource(this.warehouseData);
      this.inventoryData.paginator = this.paginator;
      this.inventoryData.sort = this.sort;
      this.inventoryData._updateChangeSubscription();
      // this.render_table = true;
    });
  }

  ngOnInit(): void {

  }


  search: any = ""

  columns = [
    {
      columnDef: 'id',
      header: 'Id',
      cell: (element: Inventory) => `${element._id}`,
    }, {
      columnDef: 'position',
      header: 'Position',
      cell: (element: Inventory) => `${element.position}`,
    }, {
      columnDef: 'code',
      header: 'Item Code',
      cell: (element: Inventory) => `${element.code}`,
    },
    {
      columnDef: 'name',
      header: 'Item Name',
      cell: (element: Inventory) => `${element.name}`,
    },
    {
      columnDef: 'category',
      header: 'Category',
      cell: (element: Inventory) => `${element.category}`,
    },
    {
      columnDef: 'price',
      header: 'Price',
      cell: (element: Inventory) => `${element.price}`,
    },
    {
      columnDef: 'total_available',
      header: 'Total',
      cell: (element: Inventory) => `${element.total_available}`,
    },
    {
      columnDef: 'remaining',
      header: 'Remaining',
      cell: (element: Inventory) => `${element.remaining}`,
    },
    {
      columnDef: 'added_on',
      header: 'Added On',
      cell: (element: Inventory) => `${element.added_on}`,
    },
    {
      columnDef: 'photo',
      header: 'Photo',
      cell: (element: Inventory) => `${element.photo}`,
    },
    {
      columnDef: 'action',
      header: 'Actions',
      cell: (element: Inventory) => false
    },
    {
      columnDef: 'is_deleted',
      header: 'IsDeleted',
      cell: (element: Inventory) => `${element.is_deleted}`,
    },
    {
      columnDef: 'delete_comment',
      header: 'Delete Comment',
      cell: (element: Inventory) => `${element.delete_comment}`,
    }
  ];

  inventoryColumns = this.columns.filter(c => c.columnDef != "position" && c.columnDef != "photo" && c.columnDef != "id" && c.columnDef != "is_deleted" && c.columnDef != "delete_comment").map(c => c.columnDef);
  selection = new SelectionModel<Inventory>(true, []);

  ngAfterViewInit() {
    // this.inventoryService.getWholeInventoryData().subscribe((data: any) => {
    //   this.inventoryData.paginator = this.paginator;
    //   this.inventoryData.sort = this.sort;
    // })
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.inventoryData.filter = filterValue.trim().toLowerCase();

    if (this.inventoryData.paginator) {
      this.inventoryData.paginator.firstPage();
    }
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.inventoryData.data.length;
    return numSelected === numRows;
  }

  masterToggle() {
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    }

    this.selection.select(...this.inventoryData.data);
  }

  checkboxLabel(row?: Inventory): string {
    if (!row) {
      return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.position! + 1}`;
  }

  addItem() {
    const addDialogRef = this.dialog.open(AddDialog, {
      width: '50vw'
    });

    addDialogRef.afterClosed().subscribe(result => {
      if (result.add) {
        this.inventoryService.addItem(result.item).subscribe((data: any) => {
          this.warehouseData = data.items
          this.inventoryData.data = this.warehouseData
        })
      }
    })
  }

  editItem(item: any) {
    let inventory_item = {}
    Object.assign(inventory_item, item)
    const updateDialogRef = this.dialog.open(UpdateDialog, {
      width: '50vw',
      data: inventory_item,
    });

    updateDialogRef.afterClosed().subscribe(result => {
      if (result.update) {
        this.inventoryService.updateItem(result.item).subscribe((data: any) => {
          for (let i = 0; i < this.inventoryData.data.length; i++) {
            if (this.inventoryData.data[i]._id == item._id) {
              this.inventoryData.data[i] = result.item
              break
            }
          }
          this.warehouseData = data.items
          this.inventoryData.data = this.inventoryData.data
        })
      }
    })


  }


  restoreItem(item: any) {
    const restoreDialogRef = this.dialog.open(RestoreDialog, {
      width: '30vw',
      data: { delete_comment: item.delete_comment }
    });

    restoreDialogRef.afterClosed().subscribe(result => {
      if (result.should_restore) {
        item.is_deleted = false
        item.delete_comment = ""
        this.inventoryService.restoreItem(item).subscribe((data: any) => {
          this.warehouseData = data.items
          this.inventoryData.data = this.inventoryData.data
        })
      }
    });
  }

  deleteItem(item: any) {
    const deleteDialogRef = this.dialog.open(DeleteDialog, {
      width: '30vw'
    });

    deleteDialogRef.afterClosed().subscribe(result => {
      if (result.should_delete) {
        if (result.restorable_delete) {
          item.is_deleted = true
          item.delete_comment = result.delete_comment
          console.log(item)
          this.inventoryService.restorableDeleteItem(item).subscribe((data: any) => {
            this.warehouseData = data.items
            this.inventoryData.data = this.inventoryData.data
          })
        }
        else {
          // this.render_table = true;
          this.inventoryService.deleteItem(item._id).subscribe((data: any) => {
            let item_pos = 0
            for (let i = 0; i < this.inventoryData.data.length; i++) {
              if (this.inventoryData.data[i]._id == item._id) {
                item_pos = i
                break
              }
            }
            this.inventoryData.data.splice(item_pos, 1)
            this.warehouseData = data.items
            this.inventoryData.data = this.inventoryData.data
            // this.render_table = true;
          })
        }
      }
    });

  }

}


export interface Inventory {
  _id?: string;
  position?: number;
  code?: string;
  name?: string;
  category?: string;
  price: number;
  total_available: number;
  remaining: number;
  added_on?: string;
  photo?: string;
  is_deleted?: boolean;
  delete_comment?: string
}

@Component({
  selector: 'delete-dialog',
  templateUrl: './delete_dialog.html',
  styleUrls: ['./home.component.scss']
})
export class DeleteDialog {
  constructor(
    public dialogRef: MatDialogRef<DeleteDialog>
  ) { }

  delete_comment: string = ""
  restorable_delete: boolean = true

  onNoClick(): void {
    this.dialogRef.close({
      should_delete: false
    });
  }

  onYesClick(): void {
    this.dialogRef.close({
      should_delete: true,
      delete_comment: this.delete_comment,
      restorable_delete: this.restorable_delete
    });
  }
}

@Component({
  selector: 'restore-dialog',
  templateUrl: './restore_dialog.html',
  styleUrls: ['./home.component.scss']
})
export class RestoreDialog {
  constructor(
    public dialogRef: MatDialogRef<RestoreDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }


  onNoClick(): void {
    this.dialogRef.close({
      should_restore: false
    });
  }

  onYesClick(): void {
    this.dialogRef.close({
      should_restore: true
    });
  }
}

@Component({
  selector: 'add-dialog',
  templateUrl: './add_dialog.html',
  styleUrls: ['./home.component.scss']
})
export class AddDialog {
  constructor(
    public dialogRef: MatDialogRef<AddDialog>
  ) { }

  item_data: Inventory = {
    _id: "",
    position: -1,
    code: "",
    name: "",
    category: "",
    price: 0,
    total_available: 0,
    remaining: 0,
    added_on: "",
    photo: ""
  };
  error: boolean = false;
  error_msg: string = ""

  onCancelClick(): void {
    let result = {
      add: false,
      item: {}
    }
    this.dialogRef.close(result);
  }

  onAddClick(): void {
    if (this.item_data.code == "" || this.item_data.code == null) {
      this.error = true
      this.error_msg = "Item code cannot be empty.\n"
    }
    if (this.item_data.name == "" || this.item_data.name == null) {
      this.error = true
      this.error_msg = "Item name cannot be empty.\n"
    }
    if (this.item_data.category == "" || this.item_data.category == null) {
      this.error = true
      this.error_msg = "Item category cannot be empty.\n"
    }
    if (this.item_data.total_available < this.item_data.remaining) {
      this.error = true
      this.error_msg = "Number of remaining items cannot exceed total number of items.\n"
    }
    if (this.item_data.total_available < 0 || this.item_data.remaining < 0 || this.item_data.price < 0) {
      this.error = true
      this.error_msg = "The price, total or remaining fields cannot be less than 0.\n"
    }
    if (!this.error) {
      let result = {
        add: true,
        item: this.item_data
      }
      delete result.item._id
      delete result.item.position
      delete result.item.added_on
      delete result.item.photo
      this.dialogRef.close(result);
    }
  }
}

@Component({
  selector: 'update-dialog',
  templateUrl: './update_dialog.html',
  styleUrls: ['./home.component.scss']
})
export class UpdateDialog {
  constructor(
    public dialogRef: MatDialogRef<UpdateDialog>,
    @Inject(MAT_DIALOG_DATA) public data: Inventory,
  ) { }

  item_data: any;
  error: boolean = false;
  error_msg: string = ""

  ngOnInit() {
    this.item_data = this.data
  }

  onCancelClick(): void {
    let result = {
      update: false,
      item: this.data
    }
    this.dialogRef.close(result);
  }

  onUpdateClick(): void {
    if (this.item_data.total_available < this.item_data.remaining) {
      this.error = true
      this.error_msg = "Number of remaining items cannot exceed total number of items."
    }
    else if (this.item_data.total_available < 0 || this.item_data.remaining < 0 || this.item_data.price < 0) {
      this.error = true
      this.error_msg = "The price, total or remaining fields cannot be less than 0."
    }
    else {
      let result = {
        update: true,
        item: this.item_data
      }
      this.dialogRef.close(result);
    }
  }

}