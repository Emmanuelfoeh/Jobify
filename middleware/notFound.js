const notFound = (req,res) => {
    res.status(404).send("No such page exists");
}

export default notFound;