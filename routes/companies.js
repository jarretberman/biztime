const express = require("express");
const router = new express.Router();
const db = require("../db")
const ExpressError = require("../expressError")
const slugify = require('slugify')




router.get("/", async function (req, res, next) {
    try {
        const companiesQuery = await db.query("SELECT id, name FROM companies")
        return res.json({ companies: companiesQuery.rows });
    } catch (err) {
        return next(err)
    }
});


router.get("/:code", async function (req, res, next) {
    try {
        const companiesQuery = await db.query(
            "SELECT code, name FROM companies WHERE code = $1", [req.params.code]);

        const invoiceQuery = await db.query(
            `SELECT id, amt FROM invoices
                WHERE  comp_id = $1`, [req.params.code]
        )
        
        const industriesQuery = await db.query(
            `SELECT i.code, i.industry
                FROM industries AS i
                LEFT JOIN companies_industries AS ci
                    ON i.code = ci.industry_code
                WHERE ci.comp_code = $1
                `, [req.params.code]
        )

        if (companiesQuery.rows.length === 0) {
            let notFoundError = new ExpressError(`There is no company with code '${req.params.code}`);
            notFoundError.status = 404;
            throw notFoundError;
        }

        const company = companiesQuery.rows[0] 
        company.invoices = invoiceQuery.rows
        company.industries = industriesQuery.rows

        return res.json({ company: company });
    } catch (err) {
        return next(err);
    }
});

router.post("/", async function (req, res, next) {
    try {
        const result = await db.query(
            `INSERT INTO companies (code,name,description) 
           VALUES ($1,$2,$3) 
           RETURNING *`,
            [slugify(req.body.name), req.body.name, req.body.description,]);

        return res.status(201).json({ company: result.rows[0] });
    } catch (err) {
        return next(err);
    }
});

router.put("/:code", async function(req, res, next) {
    try {
      if ("code" in req.body) {
        throw new ExpressError("Not allowed", 400)
      }
  
      const result = await db.query(
        `UPDATE companies 
             SET name=$1, description=$3
             WHERE code = $2
             RETURNING *`,
        [req.body.name, slugify(req.body.code), req.body.description]);
  
      if (result.rows.length === 0) {
        throw new ExpressError(`There is no ccompany with code of '${req.params.code}`, 404);
      }
  
      return res.json({ company: result.rows[0]});
    } catch (err) {
      return next(err);
    }
  });

  router.delete("/:code", async function(req, res, next) {
    try {
      const result = await db.query(
        "DELETE FROM companies WHERE code = $1 RETURNING *", [req.params.code]);
  
      if (result.rows.length === 0) {
        throw new ExpressError(`There is no company with code of '${req.params.code}`, 404);
      }
      return res.json({ message: "Company deleted" });
    } catch (err) {
      return next(err);
    }
  });
