import {SanityClient} from '@sanity/client'
import {Schema} from '@sanity/types'
import {concat, EMPTY, merge, Observable, of} from 'rxjs'
import {filter, map, mergeMap, shareReplay, tap} from 'rxjs/operators'
import {HistoryStore} from '../../history'
import {IdPair} from '../types'
import {memoize} from '../utils/createMemoizer'
import {operationArgs} from './operationArgs'
import {OperationsAPI} from './operations'
import {createOperationsAPI, GUARDED} from './operations/helpers'
import {ExecuteArgsHook, operationEventHooks} from './operationEvents'
import {memoizeKeyGen} from './memoizeKeyGen'

const LOCKABLE_OPERATIONS = ['delete']

export const lockableOperations = memoize(
  (
    ctx: {
      client: SanityClient
      schema: Schema
    },
    idPair: IdPair,
    typeName: string
  ): Observable<ExecuteArgsHook> => {
    const operationEventHooks$ = operationEventHooks(ctx)

    // To makes sure we connect the stream that actually performs the operations
    return operationEventHooks$
      .pipe(shareReplay({refCount: true, bufferSize: 1}))
      .pipe(filter((ev) => LOCKABLE_OPERATIONS.includes(ev.operationName)))
  },
  (ctx, idPair, typeName) => memoizeKeyGen(ctx.client, idPair, typeName)
)
