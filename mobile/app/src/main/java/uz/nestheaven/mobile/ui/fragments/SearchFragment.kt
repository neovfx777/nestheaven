package uz.nestheaven.mobile.ui.fragments

import android.os.Bundle
import android.view.View
import androidx.fragment.app.Fragment
import androidx.viewpager2.adapter.FragmentStateAdapter
import androidx.viewpager2.widget.ViewPager2
import com.google.android.material.tabs.TabLayout
import com.google.android.material.tabs.TabLayoutMediator
import uz.nestheaven.mobile.R

class SearchFragment : Fragment(R.layout.fragment_search) {

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        val tabs = view.findViewById<TabLayout>(R.id.searchTabs)
        val pager = view.findViewById<ViewPager2>(R.id.searchPager)

        pager.adapter = SearchPagerAdapter(this)

        val initialTab = (arguments?.getInt(ARG_INITIAL_TAB) ?: 0).coerceIn(0, 1)
        pager.setCurrentItem(initialTab, false)

        TabLayoutMediator(tabs, pager) { tab, position ->
            tab.text = when (position) {
                0 -> getString(R.string.tab_apartments)
                1 -> getString(R.string.tab_complexes)
                else -> ""
            }
        }.attach()
    }

    private class SearchPagerAdapter(fragment: Fragment) : FragmentStateAdapter(fragment) {
        override fun getItemCount(): Int = 2

        override fun createFragment(position: Int): Fragment {
            return when (position) {
                0 -> ApartmentsFragment()
                1 -> ComplexesFragment()
                else -> ApartmentsFragment()
            }
        }
    }

    companion object {
        private const val ARG_INITIAL_TAB = "initial_tab"

        fun newInstance(initialTab: Int): SearchFragment {
            return SearchFragment().apply {
                arguments = Bundle().apply {
                    putInt(ARG_INITIAL_TAB, initialTab)
                }
            }
        }
    }
}

