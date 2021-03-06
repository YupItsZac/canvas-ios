#!/usr/bin/env node
//
// This file is part of Canvas.
// Copyright (C) 2019-present  Instructure, Inc.
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.
//

const program = require('commander')
const { spawnSync } = require('child_process')
const { createReadStream, readFileSync, writeFileSync, readdir } = require('fs')
const mkdirp = require('mkdirp')
const path = require('path')
const S3 = require('aws-sdk/clients/s3')
const projects = require('./projects.json')

program
  .version(require('../../package.json').version)
  .option('-s, --skip-pull', 'Skip pulling from S3')
  .option('-n, --no-import', 'Skip importing downloaded files')
  .option('-p, --project [name]', 'Import only a specific project')
  .option('-l, --list', 'List projects that can be imported')

program.on('--help', () => {
  console.log(`
  Environment Variables:

    AWS_ACCESS_KEY_ID      AWS key, required to sync to instructure-translations S3 bucket
    AWS_SECRET_ACCESS_KEY  AWS secret, required to sync to instructure-translations S3 bucket
  \n`)
})
program.parse(process.argv)

if (program.list) {
  console.log(projects.map(({ name }) => name).join('\n'))
  process.exit(0)
}

if (
  !program.skipPull &&
  (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY)
) {
  program.outputHelp()
  process.exit(1)
}

importTranslations().catch(err => {
  console.error(err)
  process.exit(2)
})

function run(cmd, args, opts) {
  const { error, status, stderr } = spawnSync(cmd, args, opts)
  if (error || status) {
    console.error(stderr.toString())
    throw error || status
  }
}

// make it more difficult for translators to accidentally break stuff
function normalizeLocale(locale) {
  return locale.replace(/_/g, '-')
    .replace(/-x-/, '-inst')
    .replace(/-inst(\w{5,})/, '-$1')
    .replace(/-k12/, '-instk12')
    .replace(/-ukhe/, '-instukhe')
}

async function importTranslations() {
  if (!program.skipPull) {
    const Bucket = 'instructure-translations'
    const s3 = new S3({ region: 'us-east-1' })
    const listObjects = await s3.listObjectsV2({ Bucket, Prefix: `translations/canvas-ios/` }).promise()
    const keys = listObjects.Contents.map(({ Key }) => Key)
      .filter(key => !key.includes('/en/'))
      .filter(key => !program.project || key.includes(`/${program.project}.`))

    for (const key of keys) {
      let [ , , locale, basename ] = key.split('/')
      if (!locale || !basename) continue // skip folders
      locale = normalizeLocale(locale)
      const [ projectName, ext ] = basename.split('.')
      const filename = `scripts/translations/imports/${projectName}/${locale}.${ext}`
      console.log(`Pulling s3://instructure-translations/${key} to ${filename}`)

      const { Body } = await s3.getObject({ Bucket, Key: key }).promise()
      let content = Body.toString().replace(/^\uFEFF/, '') // Strip BOM
      if (key.endsWith('.json')) {
        content = content.replace(/"message": "(.*)"$/gm, (_, message) => (
          `"message": "${
            message.replace(/\\"/g, '"').replace(/"/g, '\\"')
          }"`
        ))
        content = JSON.stringify(JSON.parse(content), null, '  ')
      } else {
        content = content.replace(/target-language="[^"]*"/g, `target-language="${locale}"`)
      }

      mkdirp.sync(path.dirname(filename))
      writeFileSync(filename, content, 'utf8')
    }
  }

  if (program.import === false) return
  for (const project of projects) {
    if (program.project && project.name !== program.project) continue
    const folder = `scripts/translations/imports/${project.name}`
    const files = await new Promise(resolve =>
      readdir(folder, (err, files) => resolve(files || []))
    )
    for (const file of files) {
      if (file.startsWith('.')) continue
      console.log(`Importing ${file} into ${project.location}`)
      if (project.location.endsWith('.xcodeproj')) {
        await run('xcodebuild', [
          '-importLocalizations',
          '-localizationPath',
          `${folder}/${file}`,
          '-project',
          project.location
        ])
      } else {
        await run('cp', [
          `${folder}/${file}`,
          `${project.location}/${file}`
        ])
      }
    }
  }
}
