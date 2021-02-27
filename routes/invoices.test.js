// connect to right DB --- set before loading db.js
process.env.NODE_ENV = "test";

// npm packages
const request = require("supertest");

// app imports
const app = require("../app");
const db = require("../db");



beforeEach(async function () {
    await db.query("DELETE FROM invoices")
    await db.query("DELETE FROM companies")
    await db.query(`
      INSERT INTO
        companies (code,name) VALUES ('test','TestCompany')
        RETURNING code, name`)

    let result = await db.query(`
      INSERT INTO
        invoices (comp_code,amt) VALUES ('test',100)
        RETURNING *`);
    testInv = result.rows[0];

});



describe("GET /invoices", function () {
    test("Gets a list of invoices", async function () {
        const response = await request(app).get(`/invoices`);
        expect(response.statusCode).toEqual(200);
        expect(response.body).toEqual({ invoices: [{
            id: testInv.id,
            comp_code: testInv.comp_code}] });
    });
});



describe("GET /invoices/:id", function () {
    test("Gets a single invoice", async function () {
        const response = await request(app).get(`/invoices/${testInv.id}`);
        expect(response.statusCode).toEqual(200);
        expect(response.body).toEqual(expect.any(Object));
    });

    test("Responds with 404 if can't find invoice", async function () {
        const response = await request(app).get(`/invoices/0`);
        expect(response.statusCode).toEqual(404);
    });
});


describe("POST /",()=>{
    test('adds a invoice', async()=>{
        const response = await request(app).post(`/invoices`).send({
            comp_code: 'test',
            amt: 100
        })
        expect(response.statusCode).toEqual(201);
        // expect(response.body).toEqual({'invoice':{
        //     id: expect.any(Number),
        //     comp_code: 'test',
        //     amt: 100,
        //     add_date: expect.any(t),
        //     paid_date: null,
        //     paid: false,
        // }})
    })
})

describe("PUT /:id",()=>{
    test('updates invoice paid and date',async ()=>{
        const response = await request(app).put(`/invoices/${testInv.id}`).send({
            paid: true,
        })

        expect(response.statusCode).toEqual(201)
        // expect(response.body).toEqual({invoice:{
        //     id: testInv.id ,
        //     comp_code: 'test',
        //     amt: 200,
        //     add_date: expect.any(Date),
        //     paid_date: expect.any(Date),
        //     paid: true,
        // }})
    })

    test("Responds with 404 if can't find invoice", async function () {
        const response = await request(app).put(`/invoices/0`).send({
            paid: true,
            amt: 200
        });
        expect(response.statusCode).toEqual(404);
    });
})

describe ('DELETE /:id', () => {
    test('deletes a invoice', async()=>{
        const response = await request(app).delete(`/invoices/${testInv.id}`);
        expect(response.statusCode).toEqual(200)
        expect(response.body).toEqual({message: "Invoice deleted"})
    })
    test("Responds with 404 if can't find invoice", async function () {
        const response = await request(app).delete(`/invoices/0`);
        expect(response.statusCode).toEqual(404);
    });
})

afterAll(async function () {
    // close db connection
    await db.end();
});