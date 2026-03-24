package uz.nestheaven.mobile.ui.fragments

import android.os.Bundle
import android.view.View
import androidx.fragment.app.Fragment
import uz.nestheaven.mobile.R

class SearchFragment : Fragment(R.layout.fragment_search) {

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        if (savedInstanceState != null) return

        when (arguments?.getInt(ARG_INITIAL_TAB, MODE_EXPLORE) ?: MODE_EXPLORE) {
            MODE_APARTMENTS -> showChild(ApartmentsFragment(), addToBackStack = false)
            MODE_COMPLEXES -> showChild(ComplexesFragment(), addToBackStack = false)
            else -> showChild(SearchExploreFragment(), addToBackStack = false)
        }
    }

    companion object {
        private const val ARG_INITIAL_TAB = "initial_tab"
        const val MODE_EXPLORE = -1
        const val MODE_APARTMENTS = 0
        const val MODE_COMPLEXES = 1

        fun newInstance(initialTab: Int): SearchFragment {
            return SearchFragment().apply {
                arguments = Bundle().apply {
                    putInt(ARG_INITIAL_TAB, initialTab)
                }
            }
        }
    }

    fun openExplore() {
        childFragmentManager.popBackStack()
    }

    fun openApartmentsList() {
        showChild(ApartmentsFragment(), addToBackStack = true)
    }

    fun openComplexesList() {
        showChild(ComplexesFragment(), addToBackStack = true)
    }

    private fun showChild(fragment: Fragment, addToBackStack: Boolean) {
        val transaction = childFragmentManager.beginTransaction()
            .replace(R.id.searchContainer, fragment)
        if (addToBackStack) transaction.addToBackStack(null)
        transaction.commit()
    }
}
