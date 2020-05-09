if (!navigator) {
    navigator = {
        mediaDevices: {
            getUserMedia: function() {},
            enumerateDevices: function() {}
        },
    }
}

function createInput(type, id) {
    return {
        kind: `${type}input`,
        deviceId: `id${id}`,
        label: `label${id}`
    };
}