
    var Helper = function() {
        
    }
    
    Helper.prototype.foundUsersFormat = function(c)
    {
        var teens = c%100;
        if (teens < 15 && teens > 10) {
            return 'найдено '+c+' человек';
        }
        
        var lastDigit = c%10;
        
        switch(lastDigit) {
            case 1: 
                return 'найден '+c+' человек';
            
            case 2:
            case 3:
            case 4:
                return 'найдено '+c+' человека';
            
            case 0:
            case 5:
            case 6:
            case 7:
            case 8:
            case 9:
                return 'найдено '+c+' человек';
        }     
    }