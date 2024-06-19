async function main() {
    const SecureFileStorage = await ethers.getContractFactory("SecureFileStorage");
    console.log("Deploying SecureFileStorage...");

    // Deploy the contract
    const secureFileStorage = await SecureFileStorage.deploy();
    // await secureFileStorage.();

    console.log("SecureFileStorage deployed to:", secureFileStorage);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });