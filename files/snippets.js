sql.query(`INSERT INTO unavailable VALUES("${print.printId}", "${print.url}", "${print.find_date}", "${print.key_words}", "${print.pageText}", "${currentTimestamp}");`,
(err, res) => {
  if (err) {
      result(err, null)
  }
  result(null, res)
})

sql.query(`DELETE FROM available WHERE printId = ${print.printId};`,
    (err, res) => {  // B
      if (err) {
          result(err, null)
      }



})  // FECHA #B
