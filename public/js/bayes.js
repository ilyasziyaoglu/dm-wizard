document.getElementById('bayes').onclick = function(){
    var [modal, modal_body, modal_submit] = createModal('categorization-modal', 'Categorization')

    var form  = createElement('form')
    var form_group = createElement('div', {className: 'form-group'})
    var predict_select_label = createElement('label', {innerText: 'Select predict feature:'})
    var predict_select = createElement('select', {type: 'number', className: 'form-control'})

    var cols = df.headers
    for(var i in cols){
        predict_select.appendChild(createElement('option', {value: cols[i], innerText: cols[i]}))
    }

    modal_body.appendChild(form)
    form.appendChild(form_group)
    form_group.appendChild(predict_select_label)
    form_group.appendChild(predict_select)
    $(modal).modal('show')

    modal_submit.onclick = function(){
        $(modal).modal('hide')
        var predict = predict_select.value
        modal.remove()

        var cols = getSelectedCols()
        var uneffectedCols = []
        var effectedCols = []
        for(var i in cols){
            if((df[cols[i]].type == 'nominal' || df[cols[i]].type == 'ordinal') && cols[i] != predict){
                effectedCols.push(cols[i])
            }
            else {
                uneffectedCols.push(cols[i])
            }
        }
        if(uneffectedCols.length > 0){
            alert("Some features didn't effected! Because they may be target feature or their types are not nominal or ordinal .\nThese features are: " + uneffectedCols.toString())
        }

        var [X_train, X_test] = trainTestSplit(df)
        
        var record = {}
        var results = []
        var result
        for(var i = 0; i < X_test.length; i++){
            for(var j in effectedCols){
                record[effectedCols[j]] = X_test[effectedCols[j]].data[i]
            }
            result = bayes(X_train, record, predict)
            results.push([X_test[predict].data[i], result])
        }
        console.log(results)
        
        var sayi = 0
        for(var a in results){
            if(results[a][0] == results[a][0]){
                sayi++
            }
        }
        console.log(sayi)
    }
}

function bayes(df, X, predict){
    var predictValues =  distinctVals(df[predict].data)

    var P = {}
    for(var i in predictValues){
        P[predict+'='+predictValues[i]] =  count(df[predict].data, predictValues[i]) / df.length
    }

    for(var i in X){
        for(var j in predictValues){
            P[i+'='+X[i]+'|'+predict+'='+predictValues[j]] =  condProbab(df[i].data, df[predict].data, X[i], predictValues[j])
        }
    }

    for(var i in predictValues){
        P['X|'+predict+'='+predictValues[i]] = 1
        for(var j in X){
            P['X|'+predict+'='+predictValues[i]] *= P[j+'='+X[j]+'|'+predict+'='+predictValues[i]]
        }
    }

    for(var i in predictValues){
        P[predictValues[i]] = P['X|'+predict+'='+predictValues[i]] * P[predict+'='+predictValues[i]]
    }

    var prob = 0
    var predicted
    for(var i in predictValues){
        if(P[predictValues[i]] > prob){
            predicted = predictValues[i]
            prob = P[predictValues[i]]
        }
    }

    return predicted
}