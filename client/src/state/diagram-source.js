import _ from 'the-lodash'

class DiagramSource
{
    constructor(sharedState, socket)
    {
        this._sharedState = sharedState;
        this._socket = socket;

        this._delayedActions = {};

        this._nodeData = {};
        this._nodeChildren = {};

        this._setupSocketSubscriptions();

        this._sharedState.subscribe('diagram_expanded_dns', 
            (diagram_expanded_dns) => {
                this._updateSubscriptions();
                this._handleTreeChange();
            });
    }

    getChildren(dn)
    {
        if (this._nodeChildren[dn]) {
            return this._nodeChildren[dn];
        }
        return [];
    }

    _setupSocketSubscriptions()
    {
        this._nodesScope = this._socket.scope((value, target) => {

            if (value) {
                this._nodeData[target.dn] = value;
            } else {
                delete this._nodeData[target.dn];
            }
            
            this._handleTreeChange();

        });

        this._childrenScope = this._socket.scope((value, target) => {

            var expandedObjects = this._sharedState.get('diagram_expanded_dns');
            if (expandedObjects[target.dn])
            {
                if (value) {
                    this._nodeChildren[target.dn] = value;
                } else {
                    delete this._nodeChildren[target.dn];
                }

                this._updateMonitoredObjects();
            }

            this._handleTreeChange();
        });
    }

    _updateSubscriptions()
    {
        this._updateMonitoredObjects();
        this._updateChildrenSubscriptions();
    }

    _updateChildrenSubscriptions()
    {
        this._executeDelayedAction('update-ws-children-subscription', 
            () => {
                var expandedObjects = this._sharedState.get('diagram_expanded_dns');

                this._childrenScope.replace(_.keys(expandedObjects).map(x => ({
                    kind: 'children',
                    dn: x
                })));
            });
    }

    _updateMonitoredObjects()
    {
        this._executeDelayedAction('update-monitored-objects', 
            () => {
                var monitoredObjects = {};
        
                this._traverseTree((dn) => {
                    monitoredObjects[dn] = true;
                })
                
                this._nodesScope.replace(_.keys(monitoredObjects).map(x => ({
                    kind: 'node',
                    dn: x
                })));
            });
    }

    _handleTreeChange()
    {
        this._executeDelayedAction('build-tree', 
            () => {
                var tree = this._buildTreeData();
                this._sharedState.set('diagram_data', tree);
            });
    }

    _buildTreeData()
    {
        var treeNodes = {};
        this._traverseTree((dn, parentDn) => {
            var nodeData = this._nodeData[dn];
            if (nodeData) 
            {
                nodeData = _.clone(nodeData);
                nodeData.children = [];
                treeNodes[dn] = nodeData;

                if (parentDn)
                {
                    if (treeNodes[parentDn])
                    {
                        treeNodes[parentDn].children.push(nodeData);
                    }
                }
            }
        });

        var tree = treeNodes['root'];
        if (!tree) {
            tree = {
                "rn": "root",
                "kind": "root",
                "order": 100,
                "alertCount": {}
            };
        }

        return tree;
    }

    _executeDelayedAction(name, action, timeout)
    {
        if (this._delayedActions[name]) {
            return;
        }
        this._delayedActions[name] = true;
        timeout = timeout || 20;
        setTimeout(() => {
            this._delayedActions[name] = false;
            action();
        }, timeout);
    }

    _traverseTree(cb)
    {
        var expandedDns = this._sharedState.get('diagram_expanded_dns');

        var traverseNode = (dn, parentDn) => {
            cb(dn, parentDn);

            if (expandedDns[dn])
            {
                for(var child of this.getChildren(dn))
                {
                    traverseNode(child, dn);
                }
            }
        }

        traverseNode('root', null);
    }
}

export default DiagramSource;
