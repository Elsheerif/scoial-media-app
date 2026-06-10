import { CreateOptions, Model, ProjectionType, QueryFilter, QueryOptions } from "mongoose";




abstract class DBrepo<T> {
    constructor(protected Model: Model<T>) { }

    public async create({
        data,
        options,
    }: {
        data: any;
        options?: CreateOptions;
    }) {
        return await this.Model.create(data, options);
    }

    public async findOne({
        options,
        projection,
        filter,
    }: {
        filter?: QueryFilter<T>,
        projection?: ProjectionType<T> | null | undefined;
        options?: QueryOptions<T>;
    }) { return await this.Model.findOne(filter, projection, options); }
}

export default DBrepo;




