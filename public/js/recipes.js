const recipes = {
    'iron gear': {
        requires: [{ type: 'iron', amount: 1 }],
        produces: [{ type: 'iron gear', amount: 1}],
        time: 150
    },
    'iron beam': {
        requires: [{ type: 'iron', amount: 1 }],
        produces: [{ type: 'iron beam', amount: 1 }],
        time: 150
    },
    'copper wire': {
        requires: [{ type: 'copper', amount: 2 }],
        produces: [{ type: 'copper wire', amount: 3 }],
        time: 150
    },
    'basic circuit board': {
        requires: [{ type: 'stone plate', amount: 1 }, { type: 'copper wire', amount: 2 }],
        produces: [{ type: 'basic circuit board', amount: 1 }],
        time: 200
    },
    'windmill': {
        requires: [{ type: 'iron beam', amount: 3 }, { type: 'iron gear', amount: 2 }, { type: 'stone plate', amount: 2 }],
        produces: [{ type: 'windmill', amount: 1 }],
        time: 240
    },
    'smelter': {
        requires: [{ type: 'iron beam', amount: 2 }, { type: 'stone plate', amount: 3 }],
        produces: [{ type: 'smelter', amount: 1 }],
        time: 300
    },
    'miner': {
        requires: [{ type: 'iron gear', amount: 5 }, { type: 'iron beam', amount: 3 }, { type: 'basic circuit board', amount: 3 }],
        produces: [{ type: 'miner', amount: 1 }],
        time: 300
    }
}
