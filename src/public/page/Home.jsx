import { pipe } from 'ramda'
import React from 'react'
import { connect } from 'react-redux'
import { NavLink, withRouter } from 'react-router-dom'
import MainClassificationSelector from 'public/component/MainClassificationSelector'
import DonateButton from 'public/component/DonateButton'
import Button from 'shared/component/general/Button'
import { openSignInModal, openSignUpModal, openCookieModal } from 'shared/store/actions/modal'
import Icon from 'shared/component/general/Icon'
import debounce from 'shared/util/debounce'
import CookieConsent from 'react-cookie-consent'

const mapStateToProps = state => ({
  session: state.app.session
})

export const Home = pipe(
  connect(mapStateToProps, { openSignInModal, openSignUpModal, openCookieModal }),
  withRouter
)(
  class Home extends React.Component {
    searchInput = null

    searchInputChange = debounce(() => {
      this.props.history.push({ pathname: '/search', search: `?q=${this.searchInput.value}` })
    }, 800)

    render() {
      return (
        <div>
          <div className="jumbotron mb-5">
            {this.renderWelcome()}
            <div className="my-5 col-11 mx-auto">
              <NavLink to="/search">
                <div className="search-input-group ">
                  <label className="search-label" htmlFor="search-input">
                    <Icon fa="search" size="lg" />
                    <span className="sr-only">Feladat keresés</span>
                  </label>
                  <input
                    id="search-input"
                    type="text"
                    className="form-control"
                    placeholder="Feladat keresés ..."
                    autoFocus
                    ref={inp => (this.searchInput = inp)}
                    onChange={this.searchInputChange}
                  />
                </div>
              </NavLink>
            </div>
          </div>

          <MainClassificationSelector />

          <DonateButton />

          <CookieConsent buttonText="Rendben">
            <a href="https://firebasestorage.googleapis.com/v0/b/zsebtanar-prod.appspot.com/o/docs%2Fzsebtanar-adatvedelmi-szabalyzat-2018.pdf?alt=media&amp;token=3cd16e18-51bc-4069-af98-051df97f2fe6" target="_blank">Adatvédelmi tájékoztatónkban</a> megtalálod, hogyan gondoskodunk adataid védelméről. Oldalainkon HTTP-sütiket használunk a jobb működésért. 
            <Button className="btn btn-link" onAction={this.props.openCookieModal}>További információ</Button>
          </CookieConsent>

        </div>
      )
    }

    renderWelcome() {
      const { session, openSignUpModal, openSignInModal, openCookieModal } = this.props

      if (session.signedIn) {
        return (
          <h1 className="text-center">
            Szia {session.user.displayName || session.user.email}
          </h1>
        )
      } else {
        return (
          <div className="text-center">
            <h1>
              <strong>
                Zsebtanár
              </strong>
            </h1>
            <h4>
              Tanulás lépésről lépésre
            </h4>
          </div>
        )
      }
    }
  }
)
