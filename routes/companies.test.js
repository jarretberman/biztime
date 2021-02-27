// connect to right DB --- set before loading db.js
process.env.NODE_ENV = "test";


// npm packages
const request = require("supertest");

// app imports
const app = require("../app");
const db = require("../db");

let testComp

beforeEach(async function () {
    await db.query("DELETE FROM companies")
    let result = await db.query(`
      INSERT INTO
        companies (code,name) VALUES ('test','TestCompany')
        RETURNING code, name`);
    testComp = result.rows[0];

});



describe("GET /companies", function () {
    test("Gets a list of companies", async function () {
        const response = await request(app).get(`/companies`);
        expect(response.statusCode).toEqual(200);
        expect(response.body).toEqual({ companies: [testComp] });
    });
});



describe("GET /companies/:code", function () {
    test("Gets a single company", async function () {
        const response = await request(app).get(`/companies/${testComp.code}`);
        expect(response.statusCode).toEqual(200);
        expect(response.body).toEqual(expect.any(Object));
    });

    test("Responds with 404 if can't find company", async function () {
        const response = await request(app).get(`/companies/0`);
        expect(response.statusCode).toEqual(404);
    });
});


describe("POST /",()=>{
    test('adds a company', async()=>{
        const response = await request(app).post(`/companies`).send({
            
            name: 'Test Comp 2'
        })
        expect(response.statusCode).toEqual(201);
        expect(response.body).toEqual({'company':{
            'code': 'Test-Comp-2',
            'name': 'Test Comp 2',
            'description': null
        }})
    })
})

describe("PUT /:code",()=>{
    test('updates company name and description',async ()=>{
        const response = await request(app).put(`/companies/${testComp.code}`).send({
            name: "Test Comp 2",
            description : "test"
        })

        expect(response.statusCode).toEqual(201)
        expect(response.body).toEqual({company:{
            code: 'test',
            name: 'Test Comp 2',
            description: 'test'
        }})
    })

    test("Responds with 404 if can't find company", async function () {
        const response = await request(app).put(`/companies/0`);
        expect(response.statusCode).toEqual(404);
    });
})

describe ('DELETE /:code', () => {
    test('deletes a company', async()=>{
        const response = await request(app).delete(`/companies/${testComp.code}`);
        expect(response.statusCode).toEqual(200)
        expect(response.body).toEqual({message: "Company deleted"})
    })
    test("Responds with 404 if can't find company", async function () {
        const response = await request(app).put(`/companies/0`);
        expect(response.statusCode).toEqual(404);
    });
})

afterAll(async function () {
    // close db connection
    await db.end();
});