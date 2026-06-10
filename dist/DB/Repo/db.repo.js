class DBrepo {
    Model;
    constructor(Model) {
        this.Model = Model;
    }
    async create({ data, options, }) {
        return await this.Model.create(data, options);
    }
    async findOne({ options, projection, filter, }) { return await this.Model.findOne(filter, projection, options); }
}
export default DBrepo;
