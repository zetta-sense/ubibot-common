// Copyright 2020 gorebill
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { Observable, OperatorFunction, throwError, Subject, merge } from "rxjs";
import { switchMap, take } from "rxjs/operators";

export class StopWhenInteruptingError extends Error {
    constructor(message?: string, params?: any) {
        super(message); // 'Error' breaks prototype chain here
        Object.setPrototypeOf(this, new.target.prototype); // restore prototype chain
    }
}

/**
 * 用于cancel source observable
 *
 * @export
 * @template R
 * @param {Observable<any>} notifier
 * @returns {OperatorFunction<any, R>}
 */
export function stopWhen<R>(notifier: Observable<any>): OperatorFunction<any, R> {
    return (input$) => {
        return merge(
            input$,
            notifier.pipe(
                switchMap(() => throwError(new StopWhenInteruptingError())),
            ),
        ).pipe(
            take(1), // 必须，确保complete只按input$
        );
    };
}
