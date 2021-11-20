import {attach, createEffect} from 'effector'
import md5 from 'js-md5'

import {$babelPluginSettings} from '~/settings/state'

import {$sourceCode, $version} from './editor/state'
import {$githubUser} from './github/state'
import {addShare} from './share'
import {$shareDescription} from './share/state'

const ENDPOINT = {
  DIST: 'y6776i4nfja2lnx3gbkbmlgr3i',
  REGION: 'us-east-1',
  PUBLIC_API_KEY: 'da2-srl2uzygsnhpdd2bban5gscnza',
}

const request = data => {
  const url = `https://${ENDPOINT.DIST}.appsync-api.${ENDPOINT.REGION}.amazonaws.com/graphql`
  return fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ENDPOINT.PUBLIC_API_KEY,
    },
    body: JSON.stringify(data),
  })
    .then(req => req.json())
    .then(result => {
      if ('errors' in result) {
        console.error(result.errors)
        throw Error('request exception')
      }
      return result.data
    })
}

export const shareCodeFx = attach({
  source: {
    user: $githubUser,
    description: $shareDescription,
    code: $sourceCode,
    effectorVersion: $version,
    babelPluginOptions: $babelPluginSettings,
  },
  async effect({
    user,
    description = undefined,
    code,
    effectorVersion,
    babelPluginOptions,
  }) {
    const author = user ? user.databaseId : undefined
    const {createCodePage} = await request({
      query: `
        mutation ReplMutation($codePage: CodePageInput!) {
          createCodePage(codePage: $codePage) {
            slug
            description
            author
            created
            code
          }
        }
      `,
      variables: {
        codePage: {
          author,
          description,
          code,
          effectorVersion,
          babelPluginOptions,
        },
      },
      operationName: 'ReplMutation',
    })
    addShare({
      ...createCodePage,
      md5: md5(createCodePage.code),
    })
    return createCodePage
  },
})

export const getShareListByAuthorFx = attach({
  effect: createEffect('get share list', {
    async handler({author}: {author: number | null}) {
      if (!author) throw new Error('author required')

      const {getCodePagesByAuthor} = await request({
        query: `
          query getShareListByAuthor($author: Int!) {
            getCodePagesByAuthor(author: $author) {
              pages {
                slug
                created
                description
                code
              }
            }
          }
      `,
        variables: {
          author,
        },
        operationName: 'getShareListByAuthor',
      })
      return getCodePagesByAuthor
    },
  }),
  source: {user: $githubUser},
  mapParams: (params, {user}) => ({
    author: user ? user.databaseId : null,
  }),
})
