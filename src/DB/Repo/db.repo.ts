import { CreateOptions, DeleteResult, Model, ProjectionType, QueryFilter, QueryOptions, UpdateQuery } from "mongoose";

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
        filter?: QueryFilter<T>;
        projection?: ProjectionType<T> | null | undefined;
        options?: QueryOptions<T>;
    }) {
        return await this.Model.findOne(filter, projection, options);
    }

    public async find({
        filter,
        projection,
        options,
    }: {
        filter?: QueryFilter<T>;
        projection?: ProjectionType<T> | null | undefined;
        options?: QueryOptions<T>;
    } = {}) {
        return await this.Model.find(filter, projection, options);
    }

    public async findById(id: string, projection?: ProjectionType<T> | null | undefined) {
        return await this.Model.findById(id, projection);
    }

    public async findByIdAndUpdate(id: string, update: UpdateQuery<T>, options?: QueryOptions<T>) {
        return await this.Model.findByIdAndUpdate(id, update, { new: true, ...options });
    }

    public async findOneAndUpdate(filter: QueryFilter<T>, update: UpdateQuery<T>, options?: QueryOptions<T>) {
        return await this.Model.findOneAndUpdate(filter, update, { new: true, ...options });
    }

    public async deleteOne(filter: QueryFilter<T>) {
        return await this.Model.deleteOne(filter);
    }

    public async deleteMany(filter: QueryFilter<T>) {
        return await this.Model.deleteMany(filter);
    }
}

export default DBrepo;




