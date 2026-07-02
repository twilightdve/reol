import React from 'react'
import { HeadFC, PageProps } from 'gatsby'
import ReolMapLayout from '../../components/reolmap/layout/ReolMapLayout'
import SEO from '../../components/SEO'

const ReolMapPage: React.FC<PageProps> = () => {
  return <ReolMapLayout />
}

export const Head: HeadFC = () => (
  <SEO
    title="美辞学ナビ(会場・アクセス・参加者情報)"
    description="Reol美辞学ツアーの会場情報・アクセス・参加者をチェックできます"
    path="/bijigaku-navi/"
  />
)

export default ReolMapPage