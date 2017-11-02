//
// Copyright (C) 2016-present Instructure, Inc.
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, version 3 of the License.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.
//

/* @flow */

import { handleActions } from 'redux-actions'
import Actions from './actions'
const { filesUpdated, foldersUpdated } = Actions

export const filesData: Reducer<any, any> = handleActions({
  [filesUpdated.toString()]: (state, { payload }) => {
    const files = payload.files
    const updated = {}
    files.forEach((file) => {
      updated[file.id] = {
        ...state[file.id],
        ...file,
      }
    })
    return {
      ...state,
      ...updated,
    }
  },
}, {})

export const foldersData: Reducer<any, any> = handleActions({
  [foldersUpdated.toString()]: (state, { payload }) => {
    const folders = payload.folders
    const updated = {}
    folders.forEach((folder) => {
      updated[folder.id] = {
        ...state[folder.id],
        ...folder,
      }
    })
    return {
      ...state,
      ...updated,
    }
  },
}, {})