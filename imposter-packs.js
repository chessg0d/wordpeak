// Imposter mode — decade-themed packs for the journey from 1800 to 2020.
// Each pack belongs to a specific decade (1800, 1810, ..., 2010). At runtime
// we pick a pack matching the player's current decade, sample 4 natives + 1
// imposter, and let the player spot the misfit.
//
// "decade" = the starting year of the slot (e.g. 1820 covers the 1820s).

export const IMPOSTER_PACKS = [
  // ────────────────────────────────  1800s
  {
    id: "federalist-sunset-1800s",
    decade: 1800,
    title: "1800s — The Federalist Sunset",
    natives: [
      { name: "Thomas Jefferson", note: "president 1801–1809; Louisiana Purchase 1803" },
      { name: "John Marshall", note: "Chief Justice from 1801; Marbury v. Madison 1803" },
      { name: "Aaron Burr", note: "VP 1801–05; killed Hamilton, July 1804" },
      { name: "James Madison", note: "Sec. of State 1801–1809 under Jefferson" },
      { name: "Alexander Hamilton", note: "killed in duel, July 1804" },
      { name: "Albert Gallatin", note: "longest-serving Treasury Secretary, 1801–1814" },
      { name: "Meriwether Lewis", note: "Corps of Discovery, 1804–06" },
      { name: "William Clark", note: "Lewis's co-captain on the expedition" },
      { name: "Stephen Decatur", note: "burned the Philadelphia in Tripoli, Feb 1804" },
    ],
    imposters: [
      { name: "Andrew Jackson", note: "Battle of New Orleans 1815 — 1810s+" },
      { name: "Henry Clay", note: "Speaker from 1811 — 1810s+" },
      { name: "John C. Calhoun", note: "first elected to Congress 1810" },
      { name: "John Quincy Adams", note: "president 1825–1829" },
      { name: "DeWitt Clinton", note: "Erie Canal advocate, 1810s–20s" },
    ],
  },

  // ────────────────────────────────  1810s
  {
    id: "war-of-1812",
    decade: 1810,
    title: "1810s — Commanders of 1812",
    natives: [
      { name: "James Madison", note: "president 1809–1817; \"Mr. Madison's War\"" },
      { name: "Andrew Jackson", note: "Battle of New Orleans, Jan 1815" },
      { name: "Oliver Hazard Perry", note: "Battle of Lake Erie, Sept 1813" },
      { name: "Tecumseh", note: "killed at the Thames, Oct 1813" },
      { name: "William Henry Harrison", note: "Tippecanoe Nov 1811; Thames 1813" },
      { name: "Stephen Decatur", note: "Second Barbary War, 1815" },
      { name: "Winfield Scott", note: "wounded at Lundy's Lane, July 1814" },
      { name: "Isaac Brock", note: "British general; killed at Queenston Heights, 1812" },
      { name: "Dolley Madison", note: "saved Washington's portrait, Aug 1814" },
      { name: "Francis Scott Key", note: "wrote the anthem, Sept 1814" },
    ],
    imposters: [
      { name: "Zachary Taylor", note: "Mexican-American War, 1846–48" },
      { name: "Sam Houston", note: "Texas independence, 1836" },
      { name: "Davy Crockett", note: "1830s frontier figure; Alamo 1836" },
      { name: "John Quincy Adams", note: "Sec. State 1817; president 1825" },
    ],
  },

  // ────────────────────────────────  1820s
  {
    id: "great-triumvirate-1820s",
    decade: 1820,
    title: "1820s — The Great Triumvirate rises",
    natives: [
      { name: "John Quincy Adams", note: "Sec. State 1817–25; president 1825–29" },
      { name: "Henry Clay", note: "Speaker; 1820 Missouri Compromise architect" },
      { name: "John C. Calhoun", note: "VP 1825–32 under JQA, then Jackson" },
      { name: "Daniel Webster", note: "Senate from 1827; Dartmouth case 1819" },
      { name: "James Monroe", note: "president 1817–1825; \"Era of Good Feelings\"" },
      { name: "Andrew Jackson", note: "lost 1824 \"Corrupt Bargain\"; won 1828" },
      { name: "John Marshall", note: "McCulloch 1819, Gibbons 1824" },
      { name: "Martin Van Buren", note: "the \"Little Magician\"; building the Dems" },
      { name: "DeWitt Clinton", note: "Erie Canal opens, Oct 1825" },
      { name: "Marquis de Lafayette", note: "triumphal tour, 1824–25" },
    ],
    imposters: [
      { name: "James K. Polk", note: "president 1845–1849" },
      { name: "Zachary Taylor", note: "Mexican-American War, 1846–48" },
      { name: "Franklin Pierce", note: "president 1853–1857" },
      { name: "William Lloyd Garrison", note: "the Liberator from Jan 1831" },
      { name: "John Tyler", note: "president 1841–1845" },
    ],
  },

  // ────────────────────────────────  1830s
  {
    id: "jacksons-america-1830s",
    decade: 1830,
    title: "1830s — Jackson's America",
    natives: [
      { name: "Andrew Jackson", note: "president 1829–1837; Bank War, Indian Removal" },
      { name: "Davy Crockett", note: "killed at the Alamo, March 1836" },
      { name: "Sam Houston", note: "won at San Jacinto, 1836" },
      { name: "Nicholas Biddle", note: "Second Bank chief; Bank War antagonist" },
      { name: "Black Hawk", note: "Black Hawk War 1832; autobiography 1833" },
      { name: "Martin Van Buren", note: "VP 1833–37, president 1837–1841" },
      { name: "John C. Calhoun", note: "Nullification Crisis, 1832–33" },
      { name: "Stephen F. Austin", note: "\"Father of Texas\"; died Dec 1836" },
      { name: "Nat Turner", note: "Virginia rebellion, Aug 1831" },
      { name: "Roger Taney", note: "Chief Justice from 1836" },
    ],
    imposters: [
      { name: "John Tyler", note: "president 1841–1845" },
      { name: "James K. Polk", note: "president 1845–1849" },
      { name: "William Henry Harrison", note: "won 1840; died April 1841" },
      { name: "Frederick Douglass", note: "escaped 1838; identity is 1840s–90s" },
      { name: "Brigham Young", note: "Utah trek, 1846+" },
    ],
  },

  // ────────────────────────────────  1840s
  {
    id: "manifest-destiny-1840s",
    decade: 1840,
    title: "1840s — Manifest Destiny",
    natives: [
      { name: "James K. Polk", note: "president 1845–49; Mexican Cession, Oregon Treaty" },
      { name: "Zachary Taylor", note: "\"Old Rough and Ready\"; Buena Vista Feb 1847" },
      { name: "Winfield Scott", note: "Veracruz to Mexico City, 1847" },
      { name: "John C. Frémont", note: "\"the Pathfinder\"; California Bear Flag, 1846" },
      { name: "Brigham Young", note: "led Mormons to Salt Lake, July 1847" },
      { name: "Edgar Allan Poe", note: "\"The Raven\" 1845; died Oct 1849" },
      { name: "Stephen Kearny", note: "Army of the West; New Mexico, 1846" },
      { name: "Henry David Thoreau", note: "Walden Pond, 1845–47" },
      { name: "Frederick Douglass", note: "Narrative 1845; North Star from 1847" },
      { name: "John L. O'Sullivan", note: "coined \"Manifest Destiny,\" July 1845" },
    ],
    imposters: [
      { name: "Stephen Douglas", note: "1850s — Kansas–Nebraska Act 1854" },
      { name: "Franklin Pierce", note: "president 1853–1857" },
      { name: "Jefferson Davis", note: "Confederate president, 1861–65" },
      { name: "Robert E. Lee", note: "Army of Northern Virginia, 1861–65" },
      { name: "Harriet Beecher Stowe", note: "Uncle Tom's Cabin, 1852" },
    ],
  },

  // ────────────────────────────────  1850s
  {
    id: "gathering-storm-1850s",
    decade: 1850,
    title: "1850s — The gathering storm",
    natives: [
      { name: "Stephen Douglas", note: "Kansas–Nebraska Act 1854; Lincoln debates 1858" },
      { name: "Franklin Pierce", note: "president 1853–1857" },
      { name: "James Buchanan", note: "president 1857–1861" },
      { name: "Harriet Beecher Stowe", note: "Uncle Tom's Cabin, March 1852" },
      { name: "John Brown", note: "Pottawatomie 1856; Harpers Ferry, Oct 1859" },
      { name: "Frederick Douglass", note: "My Bondage and My Freedom, 1855" },
      { name: "Henry David Thoreau", note: "Walden, Aug 1854" },
      { name: "Roger Taney", note: "Dred Scott decision, March 1857" },
      { name: "Charles Sumner", note: "caned by Preston Brooks, May 1856" },
      { name: "Herman Melville", note: "Moby-Dick, 1851" },
    ],
    imposters: [
      { name: "George B. McClellan", note: "Union commander, 1861–62" },
      { name: "Robert E. Lee", note: "Confederate commander, 1861–65" },
      { name: "Jefferson Davis", note: "Confederate president, 1861–65" },
      { name: "Ulysses S. Grant", note: "Union general from 1862" },
      { name: "William Tecumseh Sherman", note: "March to the Sea, 1864" },
    ],
  },

  // ────────────────────────────────  1860s
  {
    id: "civil-war-1860s",
    decade: 1860,
    title: "1860s — Generals of the Blue and Gray",
    natives: [
      { name: "Abraham Lincoln", note: "president March 1861–April 1865" },
      { name: "Ulysses S. Grant", note: "Vicksburg July 1863; General-in-Chief 1864" },
      { name: "Robert E. Lee", note: "surrendered Appomattox, April 1865" },
      { name: "William Tecumseh Sherman", note: "March to the Sea, 1864" },
      { name: "Stonewall Jackson", note: "killed at Chancellorsville, May 1863" },
      { name: "Philip Sheridan", note: "Shenandoah Valley, 1864" },
      { name: "George Meade", note: "won at Gettysburg, July 1863" },
      { name: "James Longstreet", note: "Lee's \"Old War Horse\"" },
      { name: "Jefferson Davis", note: "Confederate president, 1861–65" },
      { name: "John Wilkes Booth", note: "assassinated Lincoln, April 14, 1865" },
    ],
    imposters: [
      { name: "George Custer", note: "killed at Little Bighorn, 1876" },
      { name: "Rutherford B. Hayes", note: "president 1877–1881" },
      { name: "James Garfield", note: "president 1881; assassinated" },
      { name: "Nathan Bedford Forrest", note: "Klan founder; identity stretches to 1870s" },
      { name: "Winfield Scott Hancock", note: "1880 Dem nominee" },
    ],
  },

  // ────────────────────────────────  1870s
  {
    id: "frontier-iron-horse-1870s",
    decade: 1870,
    title: "1870s — Frontier and the iron horse",
    natives: [
      { name: "George Custer", note: "killed at Little Bighorn, June 25, 1876" },
      { name: "Sitting Bull", note: "Hunkpapa leader; Little Bighorn 1876" },
      { name: "Crazy Horse", note: "surrendered May 1877; killed Sept 1877" },
      { name: "Wild Bill Hickok", note: "shot dead in Deadwood, Aug 1876" },
      { name: "Jesse James", note: "James–Younger Gang, peak 1870s" },
      { name: "Mark Twain", note: "Innocents Abroad 1869; Tom Sawyer 1876" },
      { name: "Boss Tweed", note: "Tammany ring exposed 1871; died 1878 in jail" },
      { name: "Susan B. Anthony", note: "voted illegally Nov 1872; trial 1873" },
      { name: "Chief Joseph", note: "\"I will fight no more forever,\" 1877" },
      { name: "Rutherford B. Hayes", note: "president from March 1877" },
    ],
    imposters: [
      { name: "Geronimo", note: "Apache resistance 1881–86" },
      { name: "Wyatt Earp", note: "OK Corral, Oct 26, 1881" },
      { name: "Doc Holliday", note: "OK Corral, 1881" },
      { name: "Billy the Kid", note: "killed July 1881" },
      { name: "Annie Oakley", note: "joined Buffalo Bill, 1885" },
      { name: "Buffalo Bill Cody", note: "Wild West show from 1883" },
    ],
  },

  // ────────────────────────────────  1880s
  {
    id: "captains-of-industry-1880s",
    decade: 1880,
    title: "1880s — Captains of industry",
    natives: [
      { name: "John D. Rockefeller", note: "Standard Oil Trust formed Jan 1882" },
      { name: "Andrew Carnegie", note: "\"Gospel of Wealth,\" 1889" },
      { name: "J.P. Morgan", note: "consolidating railroads; Edison's first plant 1882" },
      { name: "Thomas Edison", note: "Pearl Street Station, Sept 1882" },
      { name: "Jay Gould", note: "Gould System railroads" },
      { name: "Henry George", note: "Progress and Poverty 1879; NYC mayor run 1886" },
      { name: "Grover Cleveland", note: "president 1885–1889 (and 1893–97)" },
      { name: "Frederick Douglass", note: "Recorder of Deeds DC 1881–86" },
      { name: "Mark Twain", note: "Huckleberry Finn US release Feb 1885" },
      { name: "Chester A. Arthur", note: "president 1881–1885" },
    ],
    imposters: [
      { name: "Theodore Roosevelt", note: "president 1901–1909" },
      { name: "William McKinley", note: "president 1897–1901" },
      { name: "William Jennings Bryan", note: "Cross of Gold, 1896" },
      { name: "Nikola Tesla", note: "AC current war, 1890s" },
      { name: "Henry Ford", note: "Model T, 1908" },
      { name: "Mark Hanna", note: "McKinley kingmaker, 1896" },
    ],
  },

  // ────────────────────────────────  1890s
  {
    id: "inventors-imperialists-1890s",
    decade: 1890,
    title: "1890s — Inventors, imperialists, populists",
    natives: [
      { name: "William McKinley", note: "president 1897–1901; Spanish-American War 1898" },
      { name: "William Jennings Bryan", note: "\"Cross of Gold,\" July 1896" },
      { name: "Theodore Roosevelt", note: "Rough Riders, July 1898; NY governor 1899" },
      { name: "Nikola Tesla", note: "Chicago World's Fair 1893 lit by AC" },
      { name: "Mark Twain", note: "Pudd'nhead Wilson 1894; world tour 1895" },
      { name: "Frederick Jackson Turner", note: "\"Frontier Thesis,\" July 1893" },
      { name: "Grover Cleveland", note: "second term 1893–1897; Pullman Strike 1894" },
      { name: "Mark Hanna", note: "McKinley campaign architect, 1896" },
      { name: "Booker T. Washington", note: "Atlanta Compromise speech, Sept 1895" },
      { name: "Eugene V. Debs", note: "Pullman Strike 1894; Social Democratic Party 1898" },
    ],
    imposters: [
      { name: "Henry Ford", note: "Ford Motor 1903; Model T 1908" },
      { name: "Wright Brothers", note: "Kitty Hawk, Dec 1903" },
      { name: "W. E. B. Du Bois", note: "Souls of Black Folk 1903; NAACP 1909" },
      { name: "Upton Sinclair", note: "The Jungle, 1906" },
      { name: "Ida Tarbell", note: "Standard Oil exposé, 1902–04" },
      { name: "John Dewey", note: "1900s–30s educational philosophy" },
    ],
  },

  // ────────────────────────────────  1900s
  {
    id: "muckrakers-1900s",
    decade: 1900,
    title: "1900s — Muckrakers and the Square Deal",
    natives: [
      { name: "Theodore Roosevelt", note: "president Sept 1901–March 1909" },
      { name: "Ida Tarbell", note: "Standard Oil History serialized 1902–04" },
      { name: "Upton Sinclair", note: "The Jungle, Feb 1906" },
      { name: "Lincoln Steffens", note: "The Shame of the Cities, 1904" },
      { name: "Booker T. Washington", note: "Up From Slavery 1901; White House dinner 1901" },
      { name: "W. E. B. Du Bois", note: "The Souls of Black Folk, 1903" },
      { name: "William Howard Taft", note: "Sec. War 1904–08; president from 1909" },
      { name: "Wright Brothers", note: "Kitty Hawk Dec 1903; Le Mans 1908" },
      { name: "Henry Ford", note: "Ford Motor 1903; Model T, Oct 1908" },
      { name: "Jack London", note: "Call of the Wild 1903; White Fang 1906" },
    ],
    imposters: [
      { name: "Woodrow Wilson", note: "president 1913–1921" },
      { name: "Margaret Sanger", note: "birth control crusade from 1914" },
      { name: "Carrie Chapman Catt", note: "won 19th Amendment, 1920" },
      { name: "D. W. Griffith", note: "Birth of a Nation, 1915" },
      { name: "Albert Einstein", note: "1919 eclipse; identity is 1920s–30s" },
    ],
  },

  // ────────────────────────────────  1910s
  {
    id: "trenches-tsars-1910s",
    decade: 1910,
    title: "1910s — Trenches and tsars falling",
    natives: [
      { name: "Woodrow Wilson", note: "president March 1913–March 1921" },
      { name: "John J. Pershing", note: "AEF commander from May 1917" },
      { name: "Vladimir Lenin", note: "Russian Revolution, Oct/Nov 1917" },
      { name: "Leon Trotsky", note: "Red Army founder; Brest-Litovsk March 1918" },
      { name: "T. E. Lawrence", note: "Arab Revolt; Aqaba July 1917" },
      { name: "Carrie Chapman Catt", note: "NAWSA from 1915; \"Winning Plan\"" },
      { name: "Alice Paul", note: "Silent Sentinels at the White House, 1917" },
      { name: "Theodore Roosevelt", note: "Bull Moose 1912; died Jan 1919" },
      { name: "Pancho Villa", note: "Columbus NM raid, March 1916" },
      { name: "Kaiser Wilhelm II", note: "abdicated Nov 1918" },
      { name: "Ferdinand Foch", note: "Allied Supreme Commander from April 1918" },
    ],
    imposters: [
      { name: "Warren G. Harding", note: "president 1921–23" },
      { name: "Herbert Hoover", note: "president 1929–33" },
      { name: "Franklin D. Roosevelt", note: "president 1933–45" },
      { name: "Calvin Coolidge", note: "president 1923–29" },
      { name: "Joseph Stalin", note: "Soviet leader from 1924" },
      { name: "Adolf Hitler", note: "1930s–40s" },
    ],
  },

  // ────────────────────────────────  1920s
  {
    id: "jazz-age-1920s",
    decade: 1920,
    title: "1920s — The Jazz Age",
    natives: [
      { name: "Louis Armstrong", note: "Hot Five recordings from 1925" },
      { name: "Duke Ellington", note: "Cotton Club residency from Dec 1927" },
      { name: "F. Scott Fitzgerald", note: "Gatsby, April 1925" },
      { name: "Ernest Hemingway", note: "The Sun Also Rises, Oct 1926" },
      { name: "Babe Ruth", note: "60 home runs in 1927" },
      { name: "Al Capone", note: "Chicago boss; St. Valentine's Day 1929" },
      { name: "Charles Lindbergh", note: "solo Atlantic flight, May 20–21, 1927" },
      { name: "Bessie Smith", note: "\"Empress of the Blues\"" },
      { name: "Jack Dempsey", note: "heavyweight champ 1919–1926" },
      { name: "Calvin Coolidge", note: "president Aug 1923–March 1929" },
      { name: "Sinclair Lewis", note: "Main Street 1920; Babbitt 1922" },
      { name: "Clara Bow", note: "the \"It Girl\" of 1927" },
    ],
    imposters: [
      { name: "Franklin D. Roosevelt", note: "president 1933–45" },
      { name: "Joe Louis", note: "champ 1937–1949" },
      { name: "Bing Crosby", note: "solo peak 1934–1948" },
      { name: "Glenn Miller", note: "band-leading 1939–44" },
      { name: "John Steinbeck", note: "Tortilla Flat 1935; Grapes of Wrath 1939" },
      { name: "Lou Gehrig", note: "Iron Horse identity is 1927–1939" },
    ],
  },

  // ────────────────────────────────  1930s
  {
    id: "hard-years-1930s",
    decade: 1930,
    title: "1930s — The hard years",
    natives: [
      { name: "Franklin D. Roosevelt", note: "president March 1933–April 1945" },
      { name: "Huey Long", note: "\"Kingfish\"; assassinated Sept 1935" },
      { name: "John Dillinger", note: "killed at the Biograph, July 1934" },
      { name: "Bonnie and Clyde", note: "ambushed, May 1934" },
      { name: "John Steinbeck", note: "Grapes of Wrath, April 1939" },
      { name: "Will Rogers", note: "killed in Alaska crash, Aug 1935" },
      { name: "Dorothea Lange", note: "Migrant Mother, March 1936" },
      { name: "Lou Gehrig", note: "\"luckiest man\" speech, July 4, 1939" },
      { name: "Joe Louis", note: "heavyweight champ from June 1937" },
      { name: "J. Edgar Hoover", note: "\"G-Men\" PR campaign of the 1930s" },
      { name: "Eleanor Roosevelt", note: "\"My Day\" column from 1935" },
    ],
    imposters: [
      { name: "Harry Truman", note: "president 1945–53" },
      { name: "Dwight Eisenhower", note: "Allied commander, 1944" },
      { name: "George Patton", note: "Third Army across Europe, 1944–45" },
      { name: "Charles Lindbergh", note: "America First 1940–41" },
      { name: "Joseph McCarthy", note: "Senate 1950–54" },
    ],
  },

  // ────────────────────────────────  1940s
  {
    id: "wwii-1940s",
    decade: 1940,
    title: "1940s — Generals of the World War",
    natives: [
      { name: "Dwight Eisenhower", note: "Supreme Allied Commander Europe; D-Day 1944" },
      { name: "George Patton", note: "Third Army across France and Germany" },
      { name: "Douglas MacArthur", note: "SWPA commander; Philippines return Oct 1944" },
      { name: "Bernard Montgomery", note: "El Alamein, Oct–Nov 1942" },
      { name: "Erwin Rommel", note: "Afrika Korps; suicide Oct 1944" },
      { name: "Winston Churchill", note: "PM May 1940–July 1945" },
      { name: "Joseph Stalin", note: "Yalta Feb 1945; Potsdam July 1945" },
      { name: "George Marshall", note: "Marshall Plan, June 1947" },
      { name: "Omar Bradley", note: "12th Army Group commander" },
      { name: "Chester Nimitz", note: "signed Japanese surrender, Sept 2, 1945" },
      { name: "Adolf Hitler", note: "suicide April 30, 1945" },
    ],
    imposters: [
      { name: "William Westmoreland", note: "Vietnam commander, 1964–68" },
      { name: "Maxwell Taylor", note: "JCS chair 1962–64; Vietnam ambassador" },
      { name: "John F. Kennedy", note: "president 1961–63" },
      { name: "Richard Nixon", note: "president 1969–74" },
      { name: "Mao Zedong", note: "PRC leader 1949–1976" },
    ],
  },

  // ────────────────────────────────  1950s
  {
    id: "atomic-age-1950s",
    decade: 1950,
    title: "1950s — Hollywood, the bomb, and the box",
    natives: [
      { name: "Marilyn Monroe", note: "Gentlemen Prefer Blondes 1953; Seven Year Itch 1955" },
      { name: "James Dean", note: "Rebel Without a Cause; killed Sept 1955" },
      { name: "Elvis Presley", note: "\"Heartbreak Hotel\" Jan 1956; Ed Sullivan Sept 1956" },
      { name: "Lucille Ball", note: "I Love Lucy, Oct 1951–1957" },
      { name: "Jonas Salk", note: "polio vaccine announced April 12, 1955" },
      { name: "Edward R. Murrow", note: "See It Now McCarthy broadcast, March 1954" },
      { name: "Joseph McCarthy", note: "Army-McCarthy hearings 1954; censured Dec 1954" },
      { name: "Nikita Khrushchev", note: "First Secretary from 1953; Secret Speech 1956" },
      { name: "Mickey Mantle", note: "Triple Crown 1956; AL MVP 1956 & 1957" },
      { name: "Dwight Eisenhower", note: "president Jan 1953–Jan 1961" },
      { name: "Rosa Parks", note: "Montgomery bus, Dec 1, 1955" },
      { name: "Jack Kerouac", note: "On the Road, Sept 1957" },
    ],
    imposters: [
      { name: "Martin Luther King Jr.", note: "I Have a Dream, 1963; assassinated 1968" },
      { name: "John F. Kennedy", note: "president 1961–63" },
      { name: "Lyndon B. Johnson", note: "president 1963–69" },
      { name: "The Beatles", note: "Ed Sullivan, Feb 1964" },
      { name: "Fidel Castro", note: "took power Jan 1959; identity is 1960s–70s" },
      { name: "Malcolm X", note: "peak 1962–65; killed Feb 1965" },
    ],
  },

  // ────────────────────────────────  1960s
  {
    id: "election-issues-1968",
    decade: 1960,
    title: "1960s — Top US election issues, 1968",
    natives: [
      { name: "Vietnam War", note: "Tet Offensive, Jan–Feb '68" },
      { name: "civil rights", note: "MLK assassinated April 1968" },
      { name: "law and order", note: "Nixon's signature frame" },
      { name: "urban riots", note: "100+ cities erupt post-MLK" },
      { name: "the draft", note: "campus protests intensify" },
      { name: "the Great Society", note: "LBJ's contested program" },
      { name: "Wallace third party", note: "American Independent run" },
    ],
    imposters: [
      { name: "inflation", note: "1980's #1 issue" },
      { name: "Iran hostages", note: "1979–1981, pure Carter era" },
      { name: "gas lines", note: "OPEC '73, Iran '79" },
      { name: "Watergate", note: "broke 1972" },
      { name: "busing", note: "peaked 1971–76" },
      { name: "stagflation", note: "dominates 1973–82" },
    ],
  },

  // ────────────────────────────────  1970s
  {
    id: "boxing-70s",
    decade: 1970,
    title: "1970s — Heavyweight champs",
    natives: [
      { name: "Joe Frazier", note: "champ 1970–1973" },
      { name: "Muhammad Ali", note: "champ 1974–1978" },
      { name: "George Foreman", note: "champ 1973–1974" },
      { name: "Ken Norton", note: "WBC champ 1978" },
      { name: "Leon Spinks", note: "beat Ali, Feb 1978" },
      { name: "Jimmy Ellis", note: "WBA champ 1968–1970" },
      { name: "Ernie Shavers", note: "fought Ali, 1977" },
    ],
    imposters: [
      { name: "Larry Holmes", note: "champ 1978–1985 — 80s run" },
      { name: "Mike Weaver", note: "WBA title, 1980" },
      { name: "Gerry Cooney", note: "vs Holmes, 1982" },
      { name: "Michael Spinks", note: "heavyweight champ, 1985" },
      { name: "Mike Tyson", note: "champ from 1986" },
      { name: "Trevor Berbick", note: "beat Ali, 1981" },
    ],
  },

  // ────────────────────────────────  1980s
  {
    id: "nfl-qb-80s",
    decade: 1980,
    title: "1980s — Star NFL quarterbacks",
    natives: [
      { name: "Joe Montana", note: "4 Super Bowl wins" },
      { name: "Dan Marino", note: "MVP 1984, 48 TDs" },
      { name: "John Elway", note: "3 Super Bowl losses in the decade" },
      { name: "Jim McMahon", note: "Bears Super Bowl XX, Jan '86" },
      { name: "Phil Simms", note: "Giants Super Bowl XXI MVP" },
      { name: "Boomer Esiason", note: "Bengals MVP 1988" },
      { name: "Doug Williams", note: "Super Bowl XXII MVP, '88" },
      { name: "Ken Anderson", note: "Bengals MVP 1981" },
    ],
    imposters: [
      { name: "Troy Aikman", note: "Cowboys dynasty 1992–96" },
      { name: "Steve Young", note: "MVP 1992, 1994" },
      { name: "Brett Favre", note: "MVP run 1995–97" },
      { name: "Jim Kelly", note: "Bills Super Bowls 1991–94" },
      { name: "Warren Moon", note: "Oilers run-and-shoot, '91–93" },
    ],
  },

  // ────────────────────────────────  1980s alt — box office
  {
    id: "box-office-80s",
    decade: 1980,
    title: "1980s — Box office #1s",
    natives: [
      { name: "E.T.", note: "1982 #1, $359M domestic" },
      { name: "Return of the Jedi", note: "1983 #1" },
      { name: "The Empire Strikes Back", note: "1980 #1" },
      { name: "Indiana Jones and the Temple of Doom", note: "1984" },
      { name: "Beverly Hills Cop", note: "1984 yearly #1" },
      { name: "Back to the Future", note: "1985 #1" },
      { name: "Top Gun", note: "1986 #1" },
      { name: "Three Men and a Baby", note: "1987 #1" },
      { name: "Rain Man", note: "1988 #1" },
      { name: "Batman", note: "1989 #1" },
    ],
    imposters: [
      { name: "Titanic", note: "1997" },
      { name: "Jurassic Park", note: "1993 #1" },
      { name: "Forrest Gump", note: "1994 #1" },
      { name: "Home Alone", note: "Nov 1990" },
      { name: "Pretty Woman", note: "1990" },
      { name: "Terminator 2", note: "July 1991" },
      { name: "The Lion King", note: "1994" },
    ],
  },

  // ────────────────────────────────  1990s
  {
    id: "nba-90s",
    decade: 1990,
    title: "1990s — NBA stars",
    natives: [
      { name: "Michael Jordan", note: "6 titles, 4 MVPs in the decade" },
      { name: "Hakeem Olajuwon", note: "back-to-back titles, 1994–95" },
      { name: "David Robinson", note: "MVP 1995" },
      { name: "Karl Malone", note: "MVP 1997" },
      { name: "Patrick Ewing", note: "Knicks Finals, 1994" },
      { name: "Charles Barkley", note: "MVP 1993" },
      { name: "Scottie Pippen", note: "Jordan's wingman" },
      { name: "Reggie Miller", note: "8 points in 9 seconds, 1995" },
      { name: "Penny Hardaway", note: "Magic Finals run, 1995" },
    ],
    imposters: [
      { name: "Tim Duncan", note: "rookie '97, dynasty 2000s" },
      { name: "Kobe Bryant", note: "drafted '96, prime 2000s" },
      { name: "Allen Iverson", note: "MVP 2001" },
      { name: "Shaquille O'Neal", note: "3-peat 2000–2002" },
      { name: "LeBron James", note: "drafted 2003" },
      { name: "Magic Johnson", note: "retired Nov 1991 — 80s era" },
      { name: "Larry Bird", note: "retired 1992 — 80s era" },
    ],
  },

  // ────────────────────────────────  1990s alt — TV
  {
    id: "tv-90s",
    decade: 1990,
    title: "1990s — Top TV shows",
    natives: [
      { name: "Cheers", note: "Nielsen #1, 1990–91" },
      { name: "Roseanne", note: "Nielsen #1, 1989–90" },
      { name: "Home Improvement", note: "Nielsen #1, 1993–94" },
      { name: "Seinfeld", note: "Nielsen #1, 1994–95 & 1997–98" },
      { name: "ER", note: "Nielsen #1, 1995–97" },
      { name: "Friends", note: "top-5 from 1995" },
      { name: "Frasier", note: "top-10 mainstay" },
      { name: "60 Minutes", note: "Nielsen #1, 1991–92" },
      { name: "Touched by an Angel", note: "surprise top-5 hit" },
      { name: "Everybody Loves Raymond", note: "late-'90s rise" },
    ],
    imposters: [
      { name: "CSI", note: "premiered Oct 2000" },
      { name: "Lost", note: "premiered 2004" },
      { name: "Survivor", note: "premiered May 2000" },
      { name: "The Sopranos", note: "1999–2007 (peak is 2000s)" },
      { name: "The Cosby Show", note: "1984–1992 — 80s identity" },
      { name: "Dallas", note: "ended April 1991" },
      { name: "Will & Grace", note: "peak 2001–04" },
    ],
  },

  // ────────────────────────────────  2000s
  {
    id: "nfl-qb-2000s",
    decade: 2000,
    title: "2000s — Star NFL quarterbacks",
    natives: [
      { name: "Tom Brady", note: "3 Super Bowls in the decade" },
      { name: "Peyton Manning", note: "4 MVPs in the decade" },
      { name: "Donovan McNabb", note: "5 NFC title games" },
      { name: "Kurt Warner", note: "Super Bowl XXXIV, 2000" },
      { name: "Drew Brees", note: "Saints Super Bowl, Feb 2010" },
      { name: "Ben Roethlisberger", note: "Steelers Super Bowls, '06 & '09" },
      { name: "Eli Manning", note: "Super Bowl XLII MVP, '08" },
      { name: "Brett Favre", note: "Packers/Vikings late run" },
    ],
    imposters: [
      { name: "Aaron Rodgers", note: "Super Bowl XLV, Feb 2011" },
      { name: "Patrick Mahomes", note: "drafted 2017" },
      { name: "Russell Wilson", note: "drafted 2012" },
      { name: "Cam Newton", note: "MVP 2015" },
      { name: "Andrew Luck", note: "drafted 2012" },
      { name: "Joe Flacco", note: "Super Bowl MVP, Feb 2013" },
    ],
  },

  // ────────────────────────────────  2010s
  {
    id: "tech-titans-2010s",
    decade: 2010,
    title: "2010s — Tech titans",
    natives: [
      { name: "Tim Cook", note: "Apple CEO from Aug 2011" },
      { name: "Jeff Bezos", note: "Amazon dominance decade" },
      { name: "Mark Zuckerberg", note: "Facebook IPO, May 2012" },
      { name: "Elon Musk", note: "Tesla Model S, 2012" },
      { name: "Sundar Pichai", note: "Google CEO, Aug 2015" },
      { name: "Satya Nadella", note: "Microsoft CEO, Feb 2014" },
      { name: "Jack Dorsey", note: "Twitter / Square" },
      { name: "Reed Hastings", note: "Netflix streaming pivot" },
      { name: "Travis Kalanick", note: "Uber CEO until 2017" },
      { name: "Jensen Huang", note: "Nvidia / AI emergence" },
    ],
    imposters: [
      { name: "Steve Jobs", note: "died Oct 2011" },
      { name: "Bill Gates", note: "left Microsoft chair, Feb 2014" },
      { name: "Steve Ballmer", note: "Microsoft CEO until Feb 2014" },
      { name: "Andy Grove", note: "left Intel chair, 2005" },
      { name: "Marissa Mayer", note: "Yahoo identity is 1990s" },
    ],
  },

  // ────────────────────────────────  2010s alt — companies
  {
    id: "companies-2015",
    decade: 2010,
    title: "2010s — Top US companies, 2015",
    natives: [
      { name: "Apple", note: "first $700B company" },
      { name: "Microsoft", note: "top 5 globally" },
      { name: "Google", note: "restructured to Alphabet, Aug 2015" },
      { name: "ExxonMobil", note: "top 10 — pre-shale-collapse oil king" },
      { name: "Berkshire Hathaway", note: "top 5" },
      { name: "Johnson & Johnson", note: "top 10" },
      { name: "Wells Fargo", note: "top 10 bank" },
      { name: "General Electric", note: "still top 10 in 2015" },
      { name: "Walmart", note: "top 10" },
      { name: "Amazon", note: "rising into top 15" },
    ],
    imposters: [
      { name: "US Steel", note: "1900s industrial titan" },
      { name: "Standard Oil", note: "early 1900s — broken up 1911" },
      { name: "Sears", note: "out of top 500 by 2015" },
      { name: "General Motors", note: "bankrupted 2009" },
      { name: "Tesla", note: "~$30B in 2015 — not top 50" },
      { name: "Nvidia", note: "~$10B in 2015 — not top 100" },
      { name: "Bethlehem Steel", note: "1950s steel #2" },
    ],
  },
];

// All decades the journey passes through, in order. Player starts at the
// first and tries to clear the last; reaching past 2010 = win.
export const JOURNEY_DECADES = [
  1800, 1810, 1820, 1830, 1840, 1850, 1860, 1870,
  1880, 1890, 1900, 1910, 1920, 1930, 1940, 1950,
  1960, 1970, 1980, 1990, 2000, 2010,
];

export const STARTING_LIVES = 3;
