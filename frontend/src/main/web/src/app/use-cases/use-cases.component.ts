import { Component, OnInit, ViewChild, Input, AfterViewInit } from '@angular/core';
import {UseCaseService} from './../use-case.service';

/**
 * "ng update" to angular 9 (https://update.angular.io/#8.0:9.0l3) did not upgrade these imports
 * to include the component specific end to '@angular/material'
 */
import { MatPaginator } from '@angular/material/paginator';
import { PageEvent } from '@angular/material/paginator';


import { ChangeDetectorRef, ViewChildren, QueryList } from '@angular/core';
import {DataSource} from '@angular/cdk/collections';
import {BehaviorSubject} from 'rxjs';
import {Observable} from 'rxjs';
import {merge} from 'rxjs'
//import 'rxjs/add/observable/merge';
import { map } from 'rxjs/operators';
import {MatCheckboxModule} from '@angular/material/checkbox';
import { stringify } from '@angular/compiler/src/util';
import {Workload} from '../model/workload';
import {ConfigService} from '../services/config.service';
import {ConfigModel} from '../services/config.model';

import { SutLaunchStatusService } from '../services/sut-launch-status.service';

import { LaunchStatus }           from '../services/LaunchStatus';
import { UseCaseCardComponent } from '../use-case-card/use-case-card.component';

export class Database { // {{{
  /** Stream that emits whenever the data has been modified. If filter is applied on the data*/
  dataChange: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  get data(): any[] { return this.dataChange.value; }

  constructor(
    data : any[],     
    ) {
    // Fill up the database .
    this.dataChange.next(data);
    //debugger
  }
  getChange(data){
    this.dataChange.next(data);
  }
}

@Component({
  selector: 'app-use-cases',
  templateUrl: './use-cases.component.html',
  styleUrls: ['./use-cases.component.scss']
})
export class UseCasesComponent implements OnInit, AfterViewInit {
  config: ConfigModel = this.configService.config;

  ngAfterViewInit(): void {
    throw new Error("Method not implemented.");
  }
  @ViewChildren('useCaseCard') 
  useCaseCards: QueryList<UseCaseCardComponent>; 

  private forceHttpWorkloadRq : boolean = true;
  private sutLaunchStatus:LaunchStatus = LaunchStatus.Stopped;

  private useCaseInquiryInProgress : boolean = false;

  useCases : any[];
  length = 0;
  pageIndex = 0;
  pageSize = 200;
  database: Database;
  pageEvent: PageEvent;
  dataSource : MyDataSource;
  useCaseSelection: Map<string, any>; //one day, I'll add value objects and replace any with UseCase
  @ViewChild(MatPaginator, {static: true} ) paginator: MatPaginator;

  private getUseCase(criteria:string) : any {
    var rc:any;
    for(let i=0; i< this.useCases.length; i++){
      if (this.useCases[i].useCaseName === criteria)
      rc = this.useCases[i];
    }    
    return rc;
  }
 

constructor(
  private useCaseService : UseCaseService, 
  private sutLaunchStatusService: SutLaunchStatusService,
  private cdRef:ChangeDetectorRef,
  private configService: ConfigService) { 
//  debugger
 }

public getKey(useCase: any): string {
  return useCase.name;
}

/**
 * this destroys currently selected use case(s), so it will need to be updated.
 */
 public removeAll() {
   if (this.useCases!=null){
    while(this.useCases.length) {
      this.useCases.pop();
    }    
  }
 }
/**
 * 
 * @param $event The type here shows string, but I've confirmed its an object.
 * this was req'd: //console.log( 'useCase changed [' + JSON.stringify($event) + ']');
 */
public useCaseSelectionListener($event:string) {
    const myKey:string = this.getKey($event);
    this.useCaseSelection.set( myKey, $event);
    this.dispUseCases('upsert');
    this.updateWorkload();
}
public updateWorkload() {
    let myArray = Array.from( this.useCaseSelection );

    const workload = new Workload();
    
    //each entry is an array of 2 values:  0=key, 1=value
     for (let entry of myArray) {
        workload.useCases.push( entry[1] )
     }
     this.useCaseService.updateWorkload(
       this.config.sutAppHostname,
       this.config.sutAppPort,
       workload).subscribe();
   
}
public useCaseDeSelectionListener($event:string) {
  const myKey:string = this.getKey($event);
  this.useCaseSelection.delete( myKey );
  this.dispUseCases('delete');
  this.updateWorkload();
}

dispUseCases(ctx:string) {
  console.log('My ctx:' + ctx);
  for (let [key, value] of this.useCaseSelection) {
    console.log(key, value);
  }
}
  public load() {
    console.log("Use_Cases_Components.load()");
    this.removeAll();
    if( this.forceHttpWorkloadRq == true) {

      var _me = this;
      _me.useCaseInquiryInProgress = true;
          this.useCaseService.getUseCases(
            this.config.sutAppHostname,
            this.config.sutAppPort,     
            this.config.useCaseSearchCriteria
          ).subscribe(data=>{
            console.log("getUseCases() just returned!!");
            console.log(data);
            _me.useCaseInquiryInProgress = false;

            this.useCases= data.useCases;
            this.length = this.useCases.length;
            this.database=new Database(this.useCases);
            this.dataSource = new MyDataSource(this.database, this.paginator);
            this.useCaseSelection = new Map<string,any>();
            this.cdRef.detectChanges();
            this.getSelectedWorkload();
            this.forceHttpWorkloadRq = false;
          });
      }
  }


  getIndexOfSelectedProcessingUnit(selectedUseCase:any):number {
    var indexOfSelectedProcessingUnit:number = -1;
    for( var i:number =0; i < selectedUseCase.processingUnits.length;i++) {
      var processingUnit:any = selectedUseCase.processingUnits[i];
      if (processingUnit.selected) {
        indexOfSelectedProcessingUnit = i;
        break;
      }
    }
    return indexOfSelectedProcessingUnit;
  }
  reSelectUseCase(selectedUseCase:any) {
    var selectedIndex:number = this.getIndexOfSelectedProcessingUnit(selectedUseCase);
    var useCaseCardsAry = this.useCaseCards.toArray();

    for(var i:number = 0; i < useCaseCardsAry.length; i++ ) {

      var useCaseCardComponent:UseCaseCardComponent = useCaseCardsAry[i];
      console.log("selected useCase:" + selectedUseCase.name + " does it match this:" + useCaseCardComponent.getName() ); 
      if (selectedUseCase.name === useCaseCardComponent.getName()) {
        console.log("A match is found for " + useCaseCardComponent.getName() + "!");
        useCaseCardComponent.setSelectionState(true,selectedIndex);
        console.log('Found card 0 ' + useCaseCardsAry[i].constructor.name);
        console.log('Found card: ' + i + ' : ' + useCaseCardsAry[i].getName() );
        break;
        }
    }
    console.log("after ary");
  }
  reSetUseCaseSelection(selectedUseCases:any) {
    for( var i:number = 0; i < selectedUseCases.result.useCases.length;i++) {
      var selectedUseCase = selectedUseCases.result.useCases[i];
      console.log('re-selecting useCase:' + selectedUseCase.name);
      this.reSelectUseCase(selectedUseCase);
    }
  }
  public getSelectedWorkload() {
    console.log("UseCasesComponents.getWorkLoad()");
  /**
   * result.useCases[x].processingUnits[x].selected
   */
  this.useCaseService.getWorkload(
    this.config.sutAppHostname,
    this.config.sutAppPort,
  ).subscribe(data=>{
            this.reSetUseCaseSelection(data);            
          });
  }  
    ngOnInit() {

      this.sutLaunchStatusService.currentStatus.subscribe(
        status => {
              this.forceHttpWorkloadRq = true; //check whether there's new stuff on the classpath, 
                                               //now that the SUT has been restarted
        }
    );


  }
}

export class MyDataSource extends DataSource<any> {
  /** Stream of data that is provided to the table. */
  constructor(private dataBase: Database,  private paginator: MatPaginator) {
      super();
    console.log('In constructor');
    console.log(dataBase);
    //debugger
  }
   /** Connect function called by the table to retrieve one stream containing the data to render. */
  connect(): Observable<any[]> {
    const displayDataChanges = [
      this.dataBase.dataChange,
      this.paginator.page
    ];

//    return Observable.merge(displayDataChanges).pipe(map(() => {
    return merge(displayDataChanges).pipe(map(() => {
  let data : any[];
      this.dataBase.dataChange.subscribe(xdata=>{
        // console.log(data.data);
        data=Object.values(xdata);
        }
      );

      // // Grab the page's slice of data.
      const startIndex = this.paginator.pageIndex * this.paginator.pageSize;
      const finalData = data.splice(startIndex, this.paginator.pageSize);

      // console.log(finalData, 'finalData')
      return finalData;

    }));
  }

  disconnect() {}

}
