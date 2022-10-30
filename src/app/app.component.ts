import { HttpClient } from '@angular/common/http';
import {
  Component,
  ElementRef,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { UnsortedData } from '../assets/unsorted.interface';

@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  items: { title: string }[] = [];
  groupItem: string;
  groupIndex: any;
  result: any = [];
  uploadedCount: any[] = [];
  itemTitle: string;
  itemName: string;
  addNewItem: { active: boolean }[] = [];
  itemIndex: string;
  namedElements: any = [];
  directoryElements: any;
  draggedItem: any;
  draggedElement: any;

  @ViewChildren('typeName') typeName: QueryList<ElementRef[]>;
  @ViewChild('newDirectory', { static: false }) newDirectory: ElementRef;
  @ViewChild('newGroup', { static: false }) newGroup: ElementRef;

  constructor(private _http: HttpClient) {
    // Get JSON
    this._http.get<Response[]>('assets/unsorted.json').subscribe((val) => {
      this.result = val;
      this.setInputBooleans();
    });
  }

  // Array's same length as JSON...Hides Add New Name Field
  setInputBooleans() {
    this.addNewItem.push({ active: false });
  }

  // Add Dragstart Evt to All
  dragStartHandler(e: any) {
    this.groupIndex = e.target.dataset.group;
    this.itemIndex = e.target.dataset.name;
    this.draggedElement = e.target;
    this.draggedItem = this.draggedElement.querySelector('p').innerText;
    this.draggedElement.classList.add('dragging');
    this.collectDropZones();
  }

  dragEndHandler(e: any) {
    this.draggedElement.classList.remove('dragging');
  }

  collectDropZones() {
    this.directoryElements = Array.from(
      document.querySelectorAll('.child-container .drop-zone')
    );
    this.directoryElements.forEach((val: any, i: number) => {
      val.addEventListener('dragleave', () => {
        this.removeActiveDropZone(val);
      });
      val.addEventListener('dragover', (e: any) => {
        e.preventDefault();
        val.classList.add('drag-zone-active');
      });
      val.addEventListener('drop', (e: any) => {
        e.stopImmediatePropagation();
        this.removeActiveDropZone(val);
        this.result[this.groupIndex].items.splice([this.itemIndex], 1);
        let elem = document.createElement('li');
        elem.setAttribute('data-groupIndex', this.groupIndex);
        elem.innerHTML =
          '<p>' +
          this.draggedItem +
          "</p><div class='named-elem'><span>&#x293A;</span></div>";
        val.parentElement.querySelector('.dragged-items').appendChild(elem);
        this.namedElements = Array.from(
          document.querySelectorAll('.named-elem')
        );
        this.namedElements.forEach((elem: any, indice: number) => {
          elem.addEventListener('click', (e: any) => {
            this.uploadedCount[i] = Array.from(
              val.parentElement.querySelectorAll('.dragged-items li')
            );
            console.log(this.uploadedCount)
            e.target.parentElement.parentElement.remove();
            e.stopImmediatePropagation();
            let groupI =
              e.target.parentElement.parentElement.dataset.groupindex;
            this.result[groupI].items.push({
              name: e.target.parentElement.parentElement.querySelector('p')
                .innerText,
            });
            this.namedElements = Array.from(
              document.querySelectorAll('.named-elem')
            );
            this.uploadedCount[i].pop();
          });
        });
      });
    });
  }

  toggleBlock(i: number) {
    this.directoryElements = Array.from(
      document.querySelectorAll('.child-container .drop-zone')
    );
    let elem =
        this.directoryElements[i].parentElement.querySelector('.toggle-block'),
      arrow = this.directoryElements[i].parentElement.querySelector(
        '.toggle-block .arrow'
      );
    elem.classList.toggle('close-block');
    arrow.classList.toggle('rotate-arrow');
  }

  removeActiveDropZone(elem: any) {
    elem.classList.remove('drag-zone-active');
  }

  itemAdded() {
    if (this.itemTitle != undefined) {
      this.newDirectory.nativeElement.classList.remove('required-field');
      this.items.push({ title: this.itemTitle });
      this.itemTitle = '';
      this.removeInputs();
    } else {
      this.newDirectory.nativeElement.classList.add('required-field');
    }
    this.itemTitle = undefined;
  }

  deleteItem(i: number) {
    this.items.splice(i, 1);
    this.uploadedCount.splice(i, 1);
    let cContainer = document.querySelector(
      '.child-container .toggle-block ul'
    );
    if (cContainer.innerHTML != '') {
      let arr = Array.from(cContainer.querySelectorAll('li'));
      for (var i = 0; i < arr.length; i++) {
        let groupI = arr[i].dataset.groupindex;
        this.result[groupI].items.push({
          name: arr[i].querySelector('p').innerText,
        });
      }
    }
  }

  deleteName(i: number, j: number) {
    this.result[i].items.splice(j, 1);
    this.typeName.length - 1;
    this.removeInputs();
  }

  addGroup() {
    if (this.itemName != undefined) {
      this.newGroup.nativeElement.classList.remove('required-field');
      this.result.push({
        items: [{ name: this.itemName }],
      });
      this.itemName = '';
      this.setInputBooleans();
      this.removeInputs();
    } else {
      this.newGroup.nativeElement.classList.add('required-field');
    }
    this.itemName = undefined;
  }

  getKeyCode(e: any) {
    e.code === 'Enter' ? this.itemAdded() : '';
  }

  addGroupKeyCode(e: any) {
    e.code === 'Enter' ? this.addGroup() : '';
  }

  addNewItemField(e: any, i: number) {
    e.code === 'Enter' ? this.pushNamedItem(i) : '';
  }

  addNamedItem(i: number) {
    this.removeInputs();
    this.addNewItem[i].active = true;
  }

  pushNamedItem(i: number) {
    this.groupItem.length > 10
      ? (this.groupItem = this.groupItem.slice(0, 10) + ' . . .')
      : '';
    this.result[i].items.push({ name: this.groupItem });
    this.groupItem = undefined;
    this.addNewItem[i].active = false;
  }

  removeInputs() {
    this.addNewItem.forEach((val: any) => {
      val.active = false;
    });
  }
}
