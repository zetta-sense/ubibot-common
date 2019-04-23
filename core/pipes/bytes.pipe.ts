import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'bytes'
})
export class BytesPipe implements PipeTransform {

    transform(bytes, precision = 1, nullLabel = '-'): any {
        if (isNaN(parseFloat(bytes)) || !isFinite(bytes) || 0 === parseFloat(bytes)) { return nullLabel; }
        var units = ['bytes', 'kB', 'MB', 'GB', 'TB', 'PB'],
            number = Math.floor(Math.log(bytes) / Math.log(1024));
        return (bytes / Math.pow(1024, Math.floor(number))).toFixed(precision) + ' ' + units[number];
    }

}
