package uz.nestheaven.mobile

import android.content.Intent
import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.isVisible
import com.google.android.material.bottomnavigation.BottomNavigationView
import com.google.android.material.appbar.MaterialToolbar
import uz.nestheaven.mobile.core.ApiClient
import uz.nestheaven.mobile.core.SessionManager
import uz.nestheaven.mobile.ui.fragments.ApartmentsFragment
import uz.nestheaven.mobile.ui.fragments.AuthFragment
import uz.nestheaven.mobile.ui.fragments.ComplexesFragment
import uz.nestheaven.mobile.ui.fragments.FavoritesFragment
import uz.nestheaven.mobile.ui.fragments.ProfileFragment

class MainActivity : AppCompatActivity(),
    AuthFragment.AuthHost,
    ApartmentsFragment.ApartmentsHost,
    ComplexesFragment.ComplexesHost,
    FavoritesFragment.FavoritesHost,
    ProfileFragment.ProfileHost {

    private lateinit var sessionManager: SessionManager
    private lateinit var toolbar: MaterialToolbar
    private lateinit var bottomNav: BottomNavigationView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        ApiClient.init(applicationContext)
        sessionManager = SessionManager(this)

        setContentView(R.layout.activity_main)

        toolbar = findViewById(R.id.mainToolbar)
        bottomNav = findViewById(R.id.bottomNav)
        setSupportActionBar(toolbar)

        bottomNav.setOnItemSelectedListener { item ->
            when (item.itemId) {
                R.id.nav_apartments -> {
                    openFragment(ApartmentsFragment(), getString(R.string.tab_apartments))
                    true
                }
                R.id.nav_complexes -> {
                    openFragment(ComplexesFragment(), getString(R.string.tab_complexes))
                    true
                }
                R.id.nav_favorites -> {
                    openFragment(FavoritesFragment(), getString(R.string.tab_favorites))
                    true
                }
                R.id.nav_profile -> {
                    openFragment(ProfileFragment(), getString(R.string.tab_profile))
                    true
                }
                else -> false
            }
        }

        if (savedInstanceState == null) {
            if (sessionManager.isLoggedIn()) {
                showMainUi(selectApartments = true)
            } else {
                showAuthUi()
            }
        }
    }

    private fun showAuthUi() {
        bottomNav.isVisible = false
        toolbar.title = getString(R.string.auth_title)
        supportFragmentManager.beginTransaction()
            .replace(R.id.fragmentContainer, AuthFragment())
            .commit()
    }

    private fun showMainUi(selectApartments: Boolean = false) {
        bottomNav.isVisible = true
        if (selectApartments) {
            bottomNav.selectedItemId = R.id.nav_apartments
        }
    }

    private fun openFragment(fragment: androidx.fragment.app.Fragment, title: String) {
        toolbar.title = title
        supportFragmentManager.beginTransaction()
            .replace(R.id.fragmentContainer, fragment)
            .commit()
    }

    override fun onAuthenticated() {
        showMainUi(selectApartments = true)
    }

    override fun openApartmentDetail(id: String) {
        val intent = Intent(this, ApartmentDetailActivity::class.java)
        intent.putExtra(ApartmentDetailActivity.EXTRA_APARTMENT_ID, id)
        startActivity(intent)
    }

    override fun openComplexDetail(id: String) {
        val intent = Intent(this, ComplexDetailActivity::class.java)
        intent.putExtra(ComplexDetailActivity.EXTRA_COMPLEX_ID, id)
        startActivity(intent)
    }

    override fun requestLogin() {
        showAuthUi()
    }

    override fun onLogoutRequested() {
        showAuthUi()
    }
}
