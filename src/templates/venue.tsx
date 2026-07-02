import React from 'react'
import { HeadFC, PageProps } from 'gatsby'
import { AuthProvider } from '../contexts/AuthContext'
import { LanguageProvider } from '../i18n/LanguageContext'
import { Toaster } from 'react-hot-toast'
import VenueDetail from '../components/venue/VenueDetail'
import { getVenueById } from '../data/venues'
import SEO from '../components/SEO'

interface VenuePageContext {
  venueId: string
}

const VenuePage: React.FC<PageProps<{}, VenuePageContext>> = ({ pageContext }) => {
  const { venueId } = pageContext

  return (
    <LanguageProvider>
      <AuthProvider>
        <VenueDetail venueId={venueId} />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#363636',
              color: '#fff',
            },
          }}
        />
      </AuthProvider>
    </LanguageProvider>
  )
}

export const Head: HeadFC<{}, VenuePageContext> = ({ pageContext }) => {
  const { venueId } = pageContext
  const venue = getVenueById(venueId)

  const title = venue ? `${venue.name} - 美辞学ナビ` : '美辞学ナビ'
  const description = venue
    ? `${venue.name}（${venue.location.prefecture}）の参加表明者をチェック！`
    : 'Reol美辞学ツアーの会場詳細'

  return (
    <SEO
      title={title}
      description={description}
      path={`/bijigaku-navi/venue/${venueId}/`}
    />
  )
}

export default VenuePage
