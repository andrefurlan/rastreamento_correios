var rp = require('request-promise');
var cheerio = require("cheerio");
var json2csv = require('json2csv');
var fs = require('fs');

fs.readFile('correios.txt', 'utf8', (err, data) => {
    if (err) throw err;
    var ids = data.replace(/\s/g, ";");

    var options = {
        method: 'POST',
        uri: 'http://www2.correios.com.br/sistemas/rastreamento/multResultado.cfm',
        form: { objetos: ids },
        headers: { }
    };

    rp(options)
        .then(function (body) {
            $ = cheerio.load(body);
            var data = [];
            var values = [];
            $('td').map(function(i, foo) {
                    foo = $(foo);
                    values.push(foo.text());
                if ((i + 1) % 3 === 0) {
                    data.push(values);
                    values = [];
                }
            });
            var fields = ["identificador", "status", "data_local"];
            var dataToCSV = data.map(function(values){
                return {
                    identificador: values[0],
                    status: values[1],
                    data_local: values[2]
                }
            });
            json2csv({ data: dataToCSV, fields: fields }, function(err, csv) {
                if (err) console.log(err);
                fs.writeFile('file.csv', csv, function(err) {
                    if (err) throw err;
                    console.log('arquivo salvo como file.csv');
                });
            });
        })

        .catch(function (err) {
            console.log("não foi possível connectar com http://www2.correios.com.br/sistemas/rastreamento/multResultado.cfm")
        });

});
