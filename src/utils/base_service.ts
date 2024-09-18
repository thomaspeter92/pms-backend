import { Repository, DeepPartial, FindOneOptions } from "typeorm";

export type UpdateDataKeys<T> = keyof T & keyof DeepPartial<T>;

export interface ApiResponse<T> {
  status: "success" | "error";
  message?: string;
  data?: T;
  statusCode?: number;
}

export class BaseService<T> {
  constructor(private readonly repository: Repository<T>) {}

  /**
   * Creates a new entity using the provided data and saves it to the database.
   * @param entity - The data to create the entity with.
   * @returns An ApiResponse with the created entity data on success or an error message on failure.
   */
  async create(entity: DeepPartial<T>): Promise<ApiResponse<T>> {
    try {
      // Create the entity
      const createdEntity = await this.repository.create(entity);

      // Save entity to the DB
      const savedEntity = await this.repository.save(createdEntity);

      return { statusCode: 201, status: "success", data: savedEntity };
    } catch (error) {
      if (error.code === "23505") {
        return { statusCode: 409, status: "error", message: error.detail };
      } else {
        return { statusCode: 500, status: "error", message: error.message };
      }
    }
  }

  async update(
    id: string,
    updateData: DeepPartial<T>
  ): Promise<ApiResponse<T> | undefined> {
    try {
      // Check if the entity exists with the ID.
      const exists = await this.findOne(id);
      if (exists.statusCode === 404) {
        return exists;
      }

      // Build where condition based on primary key
      const where = {};
      const primaryKey: string =
        this.repository.metadata.primaryColumns[0].databaseName;
      where[primaryKey] = id;

      // get list of valid columns for updating
      const validColumns = this.repository.metadata.columns.map(
        (column) => column.propertyName
      );

      const updateQuery: any = {};
      const keys = Object.keys(updateData) as UpdateDataKeys<T>[];
      for (const key of keys) {
        if (
          updateData.hasOwnProperty(key) &&
          validColumns.includes(key as string)
        ) {
          updateQuery[key] = updateData[key];
        }
      }

      const result = await this.repository
        .createQueryBuilder()
        .update()
        .set(updateQuery)
        .where(where)
        .returning("*")
        .execute();

      if (result.affected > 0) {
        return { statusCode: 200, status: "success", data: result.raw[0] };
      } else {
        return {
          statusCode: 400,
          status: "error",
          data: null,
          message: "Invalid Data",
        };
      }
    } catch (error) {
      return { statusCode: 500, status: "error", message: error.message };
    }
  }

  async findOne(id: string): Promise<ApiResponse<T> | undefined> {}
}
