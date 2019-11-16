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
  selected: boolean;

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
  level: number;
  expandable: boolean;
  selected: boolean;
}

/**
 * TreeOptions database, it can build a tree structured Json object.
 * Each node in Json object represents an item or a category.
 * If a node is a category, it has children items and new items can be added under the category.
 */
class TreeBuilder {
  static buildTree(option: FormlyTreeNodeData, data: FormlyTreeNodeData) {
    return this.buildTreeOfLevel(option, data, null, 0);    
  }

  /**
   * Build the tree of the given level. The `value` is the Json object, or a sub-tree of a Json object.
   * The return value is the list of `TreeNode`.
   */
  private static buildTreeOfLevel(option: FormlyTreeNodeValue, data: FormlyTreeNodeValue, parent: FormlyTreeNode, level: number): FormlyTreeNode[] {
    return Object.keys(option).reduce<FormlyTreeNode[]>((acc, key) => {
      const optionValue = option[key];
      let optionItem = key;
      if (optionValue !== null && typeof optionValue !== 'object') {
        optionItem = optionValue;
      }

      const dataValue = data !== undefined ? data[key] : undefined;
      const node = new FormlyTreeNode(optionItem, parent);
      if (optionValue !== null && typeof optionValue === 'object') {
        node.children = TreeBuilder.buildTreeOfLevel(optionValue, dataValue, node, level + 1);        
      }

      if (!node.children && dataValue !== undefined) {
        node.selected = true;
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

  /** Map from flat node to nested node. This helps us finding the nested node to be modified */
  private flatNodeMap = new Map<FormlyTreeFlatNode, FormlyTreeNode>();

  /** Map from nested node to flattened node. This helps us to keep the same object for selection */
  private nestedNodeMap = new Map<FormlyTreeNode, FormlyTreeFlatNode>();

  private treeFlattener: MatTreeFlattener<FormlyTreeNode, FormlyTreeFlatNode>;

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
          const option = options && options.length === 1 ? options[0] : null;
          this.optionTree.data = TreeBuilder.buildTree(option, this.model);
        });
      } else {
        let options = this.to.options;
        const option = options && options.length === 1 ? options[0] : null;
        this.optionTree.data = TreeBuilder.buildTree(option, this.model);
      }
    }

    this.treeControl.dataNodes.forEach(node => {
      if (node.selected) {
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
  descendantsAllSelected(node: FormlyTreeFlatNode): boolean {
    const descendants = this.treeControl.getDescendants(node);
    const descAllSelected = descendants.every(child =>
      this.treeSelection.isSelected(child)
    );
    return descAllSelected;
  }

  /** Whether part of the descendants are selected */
  descendantsPartiallySelected(node: FormlyTreeFlatNode): boolean {
    const descendants = this.treeControl.getDescendants(node);
    const result = descendants.some(child => this.treeSelection.isSelected(child));
    return result && !this.descendantsAllSelected(node);
  }

  /** Toggle the item selection. Select/deselect all the descendants node */
  treeNodeSelectionToggle(node: FormlyTreeFlatNode): void {
    this.treeSelection.toggle(node);
    const descendants = this.treeControl.getDescendants(node);
    this.treeSelection.isSelected(node)
      ? this.treeSelection.select(...descendants)
      : this.treeSelection.deselect(...descendants);

    // Force update for the parent
    this.checkAllParentsSelection(node);

    this.updateModel();
  }

  /** Toggle a leaf item selection. Check all the parents to see if they changed */
  treeLeafSelectionToggle(node: FormlyTreeFlatNode): void {
    this.treeSelection.toggle(node);
    this.checkAllParentsSelection(node);

    node.selected = !node.selected;

    this.updateModel();
  }

  /** Update model by all the selection status */
  private updateModel() {
    // this.formControl.setValue(this.model);
  }

  hasChild = (_: number, _nodeData: FormlyTreeFlatNode) => _nodeData.expandable;

  private getLevel = (node: FormlyTreeFlatNode) => node.level;

  private isExpandable = (node: FormlyTreeFlatNode) => node.expandable;

  private getChildren = (node: FormlyTreeNode): FormlyTreeNode[] => node.children;

  /**
   * Transformer to convert nested node to flat node. Record the nodes in maps for later use.
   */
  private transformer = (node: FormlyTreeNode, level: number) => {
    const existingNode = this.nestedNodeMap.get(node);
    const flatNode = existingNode && existingNode.item === node.item
        ? existingNode
        : new FormlyTreeFlatNode();
    flatNode.item = node.item;
    flatNode.level = level;
    flatNode.expandable = !!node.children;
    flatNode.selected = node.selected;
    this.flatNodeMap.set(flatNode, node);
    this.nestedNodeMap.set(node, flatNode);

    return flatNode;
  }

  /* Checks all the parents when a leaf node is selected/unselected */
  private checkAllParentsSelection(node: FormlyTreeFlatNode): void {
    let parent: FormlyTreeFlatNode | null = this.getParentNode(node);
    while (parent) {
      this.checkRootNodeSelection(parent);
      parent = this.getParentNode(parent);
    }
  }

  /** Check root node checked state and change it accordingly */
  private checkRootNodeSelection(node: FormlyTreeFlatNode): void {
    const nodeSelected = this.treeSelection.isSelected(node);
    const descendants = this.treeControl.getDescendants(node);
    const descAllSelected = descendants.every(child =>
      this.treeSelection.isSelected(child)
    );
    if (nodeSelected && !descAllSelected) {
      this.treeSelection.deselect(node);
    } else if (!nodeSelected && descAllSelected) {
      this.treeSelection.select(node);
    }
  }

  /* Get the parent node of a node */
  private getParentNode(node: FormlyTreeFlatNode): FormlyTreeFlatNode | null {
    const currentLevel = this.getLevel(node);

    if (currentLevel < 1) {
      return null;
    }

    const startIndex = this.treeControl.dataNodes.indexOf(node) - 1;

    for (let i = startIndex; i >= 0; i--) {
      const currentNode = this.treeControl.dataNodes[i];

      if (this.getLevel(currentNode) < currentLevel) {
        return currentNode;
      }
    }
    return null;
  }
}