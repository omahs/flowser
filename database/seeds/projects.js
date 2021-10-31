/**
 * Seeds projects collection, add default 'Quick start' project
 */

const quickStartProject = [
    {
        id: "emulator",
        name: 'Emulator',
        isCustom: false,
        gateway: {
            port: 8080,
            address: 'http://host.docker.internal',
        },
        emulator: null
    },
    // TODO: uncomment when support for testnet is added
    // {
    //     id: "testnet",
    //     name: "Testnet",
    //     isCustom: false,
    //     gateway: {
    //         port: 443,
    //         address: "https://access-testnet.onflow.org"
    //     },
    //     emulator: null
    // }
    // TODO: add config for mainnet
];

try {
    db.projects.insertMany(quickStartProject);
} catch (e) {
    console.error('Can not seed projects collection');
}
