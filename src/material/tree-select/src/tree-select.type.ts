import { SelectionModel } from '@angular/cdk/collections';
import { NestedTreeControl } from '@angular/cdk/tree';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatInput } from '@angular/material/input';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import { FieldType } from '@ngx-formly/material/form-field';
import { isObservable } from 'rxjs';
import { Observable } from 'tns-core-modules/ui/page/page';

export interface TreeData { [key: string]: (TreeData | string[]); }

export interface TreeNodeData {
  path: string;
  name: string;
  children?: TreeNodeData[];
  parent?: TreeNode;
}
export class TreeNode implements TreeNodeData {
  path: string;
  name: string;
  children?: TreeNode[];
  parent?: TreeNode = null;
  expanded?: boolean;

  constructor(name: string, parent: TreeNode) {
    this.name = name;
    this.parent = parent;
    this.expanded = false;
    this.children = [];
    this.setPath();
  }

  private setPath(): void {
    if (!this.path) {
      if (this.parent) {
        this.path = (this.parent.path || '/') + this.name;
      } else {
        this.path = '/' + this.name;
      }
    }
  }
}

export class TreeBuilder {
  static buildTree(treeData: TreeData | string, parent: TreeNode): TreeNode[] {
    if (treeData) {
      if (typeof(treeData) === 'string') {
        const node: TreeNode = new TreeNode(treeData, parent);
        return [node];
      } else {
        return Object.keys(treeData).reduce((tree, currentNodeName) => {
          const node: TreeNode = new TreeNode(currentNodeName, null);
          if (!Array.isArray(treeData[currentNodeName])) {
            node.children.push(...(TreeBuilder.buildTree(treeData[currentNodeName] as TreeData, node)));
          } else {
            for (const treeDataItem of (treeData[currentNodeName] as string[])) {
              node.children.push(...(TreeBuilder.buildTree(treeDataItem, node)));
            }
          }

          return tree.concat(node);
        }, []);
      }
    } else {
      return [];
    }
  }

  static getFullCheckedNodes(optionsTree: TreeNode[], treeData: TreeData | null): TreeNode[] {
    if (treeData) {
      return Object.keys(treeData).reduce((checkedNodes, currentNodeName) => {
        let option: TreeNode;
        for (const o of optionsTree) {
          if (o.name === currentNodeName) {
            option = o;
            break;
          }
        }

        if (!Array.isArray(treeData[currentNodeName])) {
          // If the current node is a TreeData object, recursively add its children
          return checkedNodes.concat(TreeBuilder.getFullCheckedNodes(option.children, treeData[currentNodeName] as TreeData | null));
        } else {
          // If the current node is a string array, just add all the matched child nodes
          const matchedNodes: TreeNode[] = [];
          for (const treeDataItem of (treeData[currentNodeName] as string[])) {
            for (const child of option.children) {
              if (child.name === treeDataItem) {
                matchedNodes.push(child);
              }
            }
          }
          return checkedNodes.concat(matchedNodes);
        }
      }, []);
    } else {
      return [];
    }
  }
}

@Component({
  selector: 'formly-field-mat-tree-select',
  templateUrl: 'tree-select.html',
  styleUrls: ['tree-select.scss']
})
export class FormlyFieldTreeSelect extends FieldType implements OnInit {
  @ViewChild(MatInput, <any> { static: true }) formFieldControl!: MatInput;
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

  treeOptions: TreeData;
  treeControl: NestedTreeControl<TreeNode>;
  dataSource: MatTreeNestedDataSource<TreeNode>;
  treeNodeSelection = new SelectionModel<TreeNode>(true);

  constructor() {
    super();
    this.treeControl = new NestedTreeControl<TreeNode>((treeNode: TreeNode) => treeNode.children);
    this.dataSource = new MatTreeNestedDataSource<TreeNode>();
  }

  ngOnInit() {
    if (this.to.options) {
      if (isObservable(this.to.options)) {
        this.to.options.subscribe(options => {
          this.initialTreeSelect(options);
        });
      } else {
        this.initialTreeSelect(this.to.options);
      }
    }
  }

  private initialTreeSelect(options: TreeData[]) {
    if (options && options.length === 1) {
      this.treeOptions = options[0];
      const optionsTree = TreeBuilder.buildTree(this.treeOptions, null);
      this.dataSource.data = optionsTree;
  
      if (this.to.selectable) {
        const fullCheckedNodes = TreeBuilder.getFullCheckedNodes(optionsTree, this.value);
        for (const node of fullCheckedNodes) {
          this.treeNodeSelection.toggle(node);
          this.checkAllParentsSelection(node);
        }
      }
  
      this.setFieldControlValue();
    }    
  }

  hasChild(index: number, treeNode: TreeNode): boolean {
    return (treeNode.children && treeNode.children.length > 0);
  }

  /** Whether all the descendants of the node are selected */
  descendantsAllSelected(node: TreeNode): boolean {
    const descendants = this.treeControl.getDescendants(node);
    const descAllSelected = descendants.every(child => this.treeNodeSelection.isSelected(child));
    return descAllSelected;
  }

  /** Whether part of the descendants are selected */
  descendantsPartiallySelected(node: TreeNode): boolean {
    const descendants = this.treeControl.getDescendants(node);
    const result = descendants.some(child => this.treeNodeSelection.isSelected(child));
    return result && !this.descendantsAllSelected(node);
  }

  /** Toggle the node selection. Select/deselect all the descendants node */
  toggleNodeSelection(node: TreeNode): void {
    this.treeNodeSelection.toggle(node);

    const descendants = this.treeControl.getDescendants(node);
    this.treeNodeSelection.isSelected(node)
      ? this.treeNodeSelection.select(...descendants)
      : this.treeNodeSelection.deselect(...descendants);

    this.checkAllParentsSelection(node);
    this.setFieldControlValue();
  }

  /** Toggle a leaf node selection. Check all the parents to see if they changed */
  toggleLeafSelection(node: TreeNode): void {
    this.treeNodeSelection.toggle(node);

    this.checkAllParentsSelection(node);
    this.setFieldControlValue();
  }

  private setFieldControlValue() {
    this.formFieldControl.value = JSON.stringify(this.getUpdatedData());
  }

  private getUpdatedData(): TreeData {
    return this.getUpdatedDataForOptions(this.treeOptions, this.dataSource.data);
  }

  /** Get updated data */
  private getUpdatedDataForOptions(optionsTreeData: TreeData, optionsTree: TreeNode[]): TreeData {
    return Object.keys(optionsTreeData).reduce((treeData, currentNodeName) => {
      // Get the match node
      let matchNode: TreeNode;
      for (const optionTreeNode of optionsTree) {
        if (optionTreeNode.name === currentNodeName) {
          matchNode = optionTreeNode;
          break;
        }
      }

      if (matchNode) {
        // If the match node is fully selected, add all the respective options into data
        // For example: 'user': ['manage', 'group']
        if (this.treeNodeSelection.isSelected(matchNode)) {
          treeData[currentNodeName] = optionsTreeData[currentNodeName];
          return treeData;
        } else if (this.descendantsPartiallySelected(matchNode)) {
          // If the options value is partially selected, and
          if (!Array.isArray(optionsTreeData[currentNodeName])) {
            // If the options value is a TreeData object, recursively get the child TreeData
            treeData[currentNodeName] = this.getUpdatedDataForOptions(optionsTreeData[currentNodeName] as TreeData, matchNode.children);
          } else {
            // If the options value is a string array, add all the selected child node into data
            const matcheOptions = [];
            for (const option of (optionsTreeData[currentNodeName] as string[])) {
              for (const node of matchNode.children) {
                if (node.name === option) {
                  if (this.treeNodeSelection.isSelected(node)) {
                    matcheOptions.push(option);
                  }
                }
              }
            }
            treeData[currentNodeName] = matcheOptions;
          }
        }
      }

      return treeData;
    }, {});
  }

  /** Checks all the parents when a leaf node is selected/unselected */
  private checkAllParentsSelection(node: TreeNode): void {
    let parent: TreeNode | null = node.parent;
    while (parent) {
      this.checkCurrentNodeSelection(parent);
      parent = parent.parent;
    }
  }

  /** Check current node checked state and change it accordingly */
  private checkCurrentNodeSelection(node: TreeNode): void {
    const nodeSelected = this.treeNodeSelection.isSelected(node);
    const descendants = this.treeControl.getDescendants(node);

    const descAllSelected = descendants.every(child => this.treeNodeSelection.isSelected(child));

    if (nodeSelected && !descAllSelected) {
      this.treeNodeSelection.deselect(node);
    } else if (!nodeSelected && descAllSelected) {
      this.treeNodeSelection.select(node);
    }
  }
}
