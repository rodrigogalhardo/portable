/*** UNDER NO CIRCUMSTANCES DO NOT EDIT THIS FILE. THIS FILE IS COPIED                                    ***/
/*** FROM OSS UI. ANY CHANGES TO BE MADE IN KUBEVIOUS OSS UI.                                             ***/
/*** SOURCE: ../kubevious/src/lib/snapshot-processors/children-count.js                                   ***/

const _ = require('lodash');


module.exports = {
    order: 230,

    handler: ({logger, state}) => {

        for(var dn of state.getNodeDns())
        {
            processNode(dn);
        }

        /************/

        function processNode(dn)
        {
            var node = state.editableNode(dn);
            var childrenDns = state.getChildrenDns(dn);
            node.childrenCount = childrenDns.length;
        }
    }
}