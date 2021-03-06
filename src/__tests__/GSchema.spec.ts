import { Schema } from "swagger-schema-official";
import { GSchema } from "../GSchema";
import { printNode } from "../util";
import swagger from "./fixtures/swagger.json";
describe("GSchema", () => {
  it("正确生成枚举类型", () => {
    const gSchema = new GSchema(
      swagger.definitions.Pet.properties.status as Schema
    );
    expect(printNode(gSchema.tsType())).toBe(
      '"available" | "pending" | "sold"'
    );
  });
  it("number和integer都会生成number类型", () => {
    const gSschemaN = new GSchema({ type: "number" });
    const gSchemaI = new GSchema({ type: "integer" });
    expect(printNode(gSschemaN.tsType())).toBe("number");
    expect(printNode(gSchemaI.tsType())).toBe("number");
  });
  it("能够正确生成array类型", () => {
    const gSchema = new GSchema(
      swagger.definitions.Pet.properties.tags as Schema
    );
    expect(printNode(gSchema.tsType())).toBe("Tag[]");
  });
  it("正确生成ref类型，不合法字符转换成下划线", () => {
    const gSchema = new GSchema({ $ref: "#/definitions/Test." });
    expect(printNode(gSchema.tsType())).toBe("Test_");
  });
  it("正确生成object，并为字段添加注释", () => {
    const gSchema = new GSchema(swagger.definitions.Order as Schema);
    expect(printNode(gSchema.tsType())).toBe(`{
    id?: number;
    petId?: number;
    quantity?: number;
    shipDate?: string;
    /**
     * Order Status */
    status?: "placed" | "approved" | "delivered";
    complete?: boolean;
}`);
  });

  it("如果schema不存在，返回unknown类型", () => {
    const gSchema = new GSchema(undefined);
    expect(printNode(gSchema.tsType())).toBe("unknown");
  });

  it("如果类型是file，返回any类型", () => {
    const gSchema = new GSchema({ type: "file" });
    expect(printNode(gSchema.tsType())).toBe("any");
  });

  it("如果schema type 为 object，没有其他数据，返回 Record<string, any>", () => {
    const gSchema = new GSchema({ type: "object" });
    expect(printNode(gSchema.tsType())).toBe("Record<string, any>");
  });
  it("如果 additionalProperties 为 true，返回 Record<string, any>", () => {
    const gSchema = new GSchema({ type: "object", additionalProperties: true });
    expect(printNode(gSchema.tsType())).toBe("Record<string, any>");
  });
  it("如果 additionalProperties 为 空对象，返回 Record<string, any>", () => {
    const gSchema = new GSchema({ type: "object", additionalProperties: true });
    expect(printNode(gSchema.tsType())).toBe("Record<string, any>");
  });
  it("如果 additionalProperties 为schema，返回 Record<string, schema类型>", () => {
    // 嵌套
    const gSchema = new GSchema({
      type: "object",
      additionalProperties: {
        type: "object",
        additionalProperties: {
          type: "string",
        },
      },
    });
    expect(printNode(gSchema.tsType())).toBe(
      "Record<string, Record<string, string>>"
    );
  });
  it("支持allOf", () => {
    const gSchema = new GSchema({
      description: "A representation of a cat",
      allOf: [
        {
          $ref: "#/definitions/Pet",
        },
        {
          type: "object",
          properties: {
            huntingSkill: {
              type: "string",
              description: "The measured skill for hunting",
              default: "lazy",
              enum: ["clueless", "lazy", "adventurous", "aggressive"],
            },
          },
          required: ["huntingSkill"],
        },
      ],
    });
    expect(printNode(gSchema.tsType())).toBe(
      `
Pet & {
    /**
     * The measured skill for hunting */
    huntingSkill: "clueless" | "lazy" | "adventurous" | "aggressive";
}
    `.trim()
    );
  });
});
