const express = require("express");
const router = new express.Router();
const db = require("../db")
const ExpressError = require("../expressError")



router.get("/", async function (req, res, next) {
    try {
      const result = await db.query(
            `SELECT i.code, i.industry, c.name
               FROM industries AS i
                 LEFT JOIN companies_industries AS ci 
                   ON i.code = ci.industry_code
                 LEFT JOIN companies AS c ON ci.comp_code = c.code`);
    
      let industries = []
      for( let industry of result){
        let companies = results.map(r => r.name)
        industry.companies = companies
        industries.push(industry)
      }
  
      return res.json(industries);
    }
  
    catch (err) {
      return next(err);
    }
  });

router.get("/:code", async function (req, res, next) {
    try{

        const result = await db.query(
            `SELECT i.code, i.industry, c.name
               FROM industries AS i
                 LEFT JOIN companies_industries AS ci 
                   ON i.code = ci.industry_code
                 LEFT JOIN companies AS c ON ci.comp_code = c.code
                 WHERE i.code = $1 `, [req.params.code]);

        let {code,industry} = results[0]
        let companies = result.rows.map(r => r.name);

        return res.json({code,industry,companies})



    } catch (err) {
      return next(err);
    }
})

router.post("/", async function (req,res,next) {
    try {
        const result = await db.query(
            `INSERT INTO industries (code, industry) 
           VALUES ($1,$2) 
           RETURNING *`, [ req.body.code, req.body.industry])

        return res.status(201).json({industry:result.rows[0]})
        
    } catch (err) {
        return next(err)
    }

})

router.put('/:code', async function (req,res,next){
    try {

        const result = await db.query(
            `INSERT INTO companies_industries(comp_code,industry_code)
             VALUES ($1,$2)
             RETURNING *`, [req.body.code, req.params.code])
            
        return res.status(201).json({industry: result.rows[0]})
        
    } catch (err) {
        return next(err)
    }
})