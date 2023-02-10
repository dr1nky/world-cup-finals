const axios = require('axios');
const cheerio = require('cheerio');
const express = require('express');

const app = express();

const url = "https://en.wikipedia.org/wiki/List_of_FIFA_World_Cup_finals";
const result = [];

axios(url)
  .then(response => {
    const html = response.data;
    const $ = cheerio.load(html);
    const content = $('.wikitable');
    const table = $(content[1]);
    const title = table.find('caption').text().trim();

    // https://stackoverflow.com/questions/69890934/nodejs-program-to-scrape-table-columns-from-wikipedia

    let headers = table.find('tbody tr th').map(function() {
      return $(this).text().trim();
    }).toArray();


    headers = headers.slice(0, 7);

    let years = table.find('tbody').map(function() {
      let cells = $(this).find('th').map(function() {
        return $(this).text().trim();
      }).toArray().slice(8, -10);
      return [cells];
    }).toArray();

    let data = table.find('tbody tr').map(function() {
      let cells = $(this).find('td').map(function() {
        return $(this).text().trim();
      }).toArray();
      cells = cells.slice(0, -1);
      return [cells];
    }).toArray().slice(1, -3);

    for (let i = 0; i < years.length; i++) {
      for (let j = 0; j < data.length; j++) {
        data[j].splice(0, 0, years[i][j]);
      }
    }

    result.push(headers, data, title);

    const finals = result[1].forEach(el => {
      let year = el[0];
      let winners = el[1];
      let score = el[2];
      let runners_up = el[3];
      let venue = el[4];
      let location = el[5];
      let attendance = el[6];
      console.log({year, winners, score, runners_up, venue, location, attendance})
    });

  }).catch(err => console.log(err));

app.get('/', (req, res) => {
  res.json(result)
})

app.listen(8000, () => console.log(`Server is running!`));