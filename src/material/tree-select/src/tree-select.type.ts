import { SelectionModel } from '@angular/cdk/collections';
import { FlatTreeControl } from '@angular/cdk/tree';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { FieldType } from '@ngx-formly/material/form-field';
import { isObservable, Subscription } from 'rxjs';

export type FormlyTreeNodeValue = FormlyTreeNodeData | string[] | null;
export type FormlyTreeNodeData = {[key: string]: FormlyTreeNodeValue} ;

/**
 * Node for item
 */
class FormlyTreeNode {
  item: string;
  path: string;
  children: FormlyTreeNode[];
  parent: FormlyTreeNode;
  selectedLeaf: boolean;

  constructor(item: string, parent: FormlyTreeNode) {
    this.item = item;
    this.parent = parent;
    this.setPath();
  }

  private setPath(): void {
    if (!this.path) {
      if (this.parent) {
        this.path = this.parent.path + '/' + this.item;
      } else {
        this.path = '/' + this.item;
      }
    }
  }
}

/** Flat item node with expandable and level information */
class FormlyTreeFlatNode {
  item: string;
  path: string;
  level: number;
  expandable: boolean;
  selectedLeaf: boolean;
}

/**
 * TreeOptions database, it can build a tree structured Json object.
 * Each node in Json object represents an item or a category.
 * If a node is a category, it has children items and new items can be added under the category.
 */
class TreeBuilder {
  static buildTree(option: FormlyTreeNodeData, model: FormlyTreeNodeData): FormlyTreeNode[] {
    return this.buildTreeOfLevel(option, model, null, 0);    
  }

  static getModel(option: FormlyTreeNodeData, treeControl: FlatTreeControl<FormlyTreeFlatNode>): FormlyTreeNodeData {
    return null;
  }

  /**
   * Build the tree of the given level. The `value` is the Json object, or a sub-tree of a Json object.
   * The return value is the list of `TreeNode`.
   */
  private static buildTreeOfLevel(option: FormlyTreeNodeValue, model: FormlyTreeNodeValue, parent: FormlyTreeNode, level: number): FormlyTreeNode[] {
    return Object.keys(option).reduce<FormlyTreeNode[]>((acc, key) => {
      const optionValue = option[key];
      let optionItem = key;
      if (optionValue !== null && typeof optionValue !== 'object') {
        optionItem = optionValue;
      }

      const modelValue = model !== undefined ? model[key] : undefined;
      const node = new FormlyTreeNode(optionItem, parent);
      if (optionValue !== null && typeof optionValue === 'object') {
        node.children = TreeBuilder.buildTreeOfLevel(optionValue, modelValue, node, level + 1);        
      }

      if (!node.children && modelValue !== undefined) {
        node.selectedLeaf = true;
      }

      return acc.concat(node);
    }, []);
  }
}

/**
 * This component is built upon the sample of mat tree.
 */
@Component({
  selector: 'formly-field-mat-tree-select',
  templateUrl: 'tree-select.html',
  styleUrls: ['tree-select.scss']
})
export class FormlyFieldTreeSelect extends FieldType implements OnInit, OnDestroy {
  defaultOptions = {
    templateOptions: {
      hideFieldUnderline: true,
      floatLabel: 'always',
      options: [],
      selectable: true
    },
  };
  
  get type() {
    return this.to.type || 'tree-select';
  }

  treeControl: FlatTreeControl<FormlyTreeFlatNode>;

  optionTree: MatTreeFlatDataSource<FormlyTreeNode, FormlyTreeFlatNode>;

  /** The selection for checklist */
  treeSelection = new SelectionModel<FormlyTreeFlatNode>(true /* multiple */);

  /** Map from path to nested node */
  private nodeMap = new Map<string, FormlyTreeNode>();

  /** Map from path to flattened node */
  private flatNodeMap = new Map<string, FormlyTreeFlatNode>();

  private treeFlattener: MatTreeFlattener<FormlyTreeNode, FormlyTreeFlatNode>;

  private option = null;
  private optionsSubscription: Subscription = null;

  constructor() {
    super();

    this.treeFlattener = new MatTreeFlattener(this.transformer, this.getLevel,
      this.isExpandable, this.getChildren);
    this.treeControl = new FlatTreeControl<FormlyTreeFlatNode>(this.getLevel, this.isExpandable);
    this.optionTree = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
  }

  ngOnInit() {
    super.ngOnInit();

    if (this.to.options) {
      if (isObservable(this.to.options)) {
        this.optionsSubscription = this.to.options.subscribe(options => {
          this.option = options && options.length === 1 ? options[0] : null;
          this.optionTree.data = TreeBuilder.buildTree(this.option, this.model);
        });
      } else {
        let options = this.to.options;
        this.option = options && options.length === 1 ? options[0] : null;
        this.optionTree.data = TreeBuilder.buildTree(this.option, this.model);
      }
    }

    this.treeControl.dataNodes.forEach(node => {
      if (node.selectedLeaf) {
        this.treeLeafSelectionToggle(node);
      }
    });    
  }

  ngOnDestroy() {
    if (this.optionsSubscription !== null) {
      this.optionsSubscription.unsubscribe();
      this.optionsSubscription = null;
    }

    super.ngOnDestroy();
  }
  
  /** Whether all the descendants of the node are selected. */
  descendantsAllSelected(flatNode: FormlyTreeFlatNode): boolean {
    const descendants = this.treeControl.getDescendants(flatNode);
    const descAllSelected = descendants.every(child =>
      this.treeSelection.isSelected(child)
    );
    return descAllSelected;
  }

  /** Whether part of the descendants are selected */
  descendantsPartiallySelected(flatNode: FormlyTreeFlatNode): boolean {
    const descendants = this.treeControl.getDescendants(flatNode);
    const result = descendants.some(child => this.treeSelection.isSelected(child));
    return result && !this.descendantsAllSelected(flatNode);
  }

  /** Toggle the item selection. Select/deselect all the descendants node */
  treeNodeSelectionToggle(flatNode: FormlyTreeFlatNode): void {
    this.treeSelection.toggle(flatNode);

    // Force update for the children
    const descendants = this.treeControl.getDescendants(flatNode);
    this.treeSelection.isSelected(flatNode)
      ? this.treeSelection.select(...descendants)
      : this.treeSelection.deselect(...descendants);

    // Force update for the parent
    this.checkAllParentsSelection(flatNode);

    this.updateModel();
  }

  /** Toggle a leaf item selection. Check all the parents to see if they changed */
  treeLeafSelectionToggle(flatNode: FormlyTreeFlatNode): void {
    this.treeSelection.toggle(flatNode);

    // Force update for the parent
    this.checkAllParentsSelection(flatNode);

    // Set the selected flag for leaves
    flatNode.selectedLeaf = !flatNode.selectedLeaf;

    this.updateModel();
  }

  /** Update model by all the selection status */
  private updateModel() {
    //this.model = TreeBuilder.getModel(this.option, this.treeControl);
  }

  hasChild = (i: number, flatNode: FormlyTreeFlatNode) => flatNode.expandable;

  private getLevel = (flatNode: FormlyTreeFlatNode) => flatNode.level;

  private isExpandable = (flatNode: FormlyTreeFlatNode) => flatNode.expandable;

  private getChildren = (node: FormlyTreeNode): FormlyTreeNode[] => node.children;

  /**
   * Transformer to convert nested node to flat node. Record the nodes in maps for later use.
   */
  private transformer = (node: FormlyTreeNode, level: number): FormlyTreeFlatNode => {
    const path: string = node.path;
    const existingFlatNode = this.flatNodeMap.get(path);
    const flatNode = existingFlatNode && existingFlatNode.path === path
        ? existingFlatNode
        : new FormlyTreeFlatNode();
    flatNode.item = node.item;
    flatNode.path = path;
    flatNode.level = level;
    flatNode.expandable = !!node.children;
    flatNode.selectedLeaf = node.selectedLeaf;
    
    this.nodeMap.set(path, node);
    this.flatNodeMap.set(path, flatNode);

    return flatNode;
  }

  /* Checks all the parents when a leaf node is selected/unselected */
  private checkAllParentsSelection(flatNode: FormlyTreeFlatNode): void {
    let parent: FormlyTreeFlatNode | null = this.getParentNode(flatNode);
    while (parent) {
      this.checkRootNodeSelection(parent);
      parent = this.getParentNode(parent);
    }
  }

  /** Check root node checked state and change it accordingly */
  private checkRootNodeSelection(flatNode: FormlyTreeFlatNode): void {
    const nodeSelected = this.treeSelection.isSelected(flatNode);
    const descendants = this.treeControl.getDescendants(flatNode);
    const descAllSelected = descendants.every(child =>
      this.treeSelection.isSelected(child)
    );
    if (nodeSelected && !descAllSelected) {
      this.treeSelection.deselect(flatNode);
    } else if (!nodeSelected && descAllSelected) {
      this.treeSelection.select(flatNode);
    }
  }

  /* Get the parent node of a node */
  private getParentNode(flatNode: FormlyTreeFlatNode): FormlyTreeFlatNode | null {
    const node: FormlyTreeNode = this.nodeMap.get(flatNode.path);
    const parentNode = node.parent;
    if (parentNode) {
      const parentFlatNode = this.flatNodeMap.get(parentNode.path);
      return parentFlatNode;
    } else {
      return null;
    }    
  }
}