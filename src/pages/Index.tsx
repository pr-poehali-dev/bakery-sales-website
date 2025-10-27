import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { format, subDays } from 'date-fns';
import { ru } from 'date-fns/locale';
import * as XLSX from 'xlsx';

interface Product {
  id: number;
  name: string;
  category: string;
  emoji: string;
  sales: number;
  price: number;
}

interface DailyStats {
  date: string;
  sales: number;
  revenue: number;
  productsSold: { [key: number]: number };
}

interface SalesHistory {
  [dateKey: string]: DailyStats;
}

const INITIAL_PRODUCTS: Product[] = [
  { id: 1, name: 'Пирожок с капустой', category: 'Пирожки', emoji: '🥟', sales: 0, price: 45 },
  { id: 2, name: 'Пирожок с картошкой', category: 'Пирожки', emoji: '🥔', sales: 0, price: 45 },
  { id: 3, name: 'Пирожок с мясом', category: 'Пирожки', emoji: '🥩', sales: 0, price: 55 },
  { id: 4, name: 'Чебурек с мясом', category: 'Пирожки', emoji: '🌮', sales: 0, price: 80 },
  { id: 5, name: 'Чебурек с сыром', category: 'Пирожки', emoji: '🧀', sales: 0, price: 75 },
  { id: 6, name: 'Хачапури с сыром', category: 'Пирожки', emoji: '🍕', sales: 0, price: 120 },
  { id: 7, name: 'Хачапури с сыром и зеленью', category: 'Пирожки', emoji: '🥬', sales: 0, price: 130 },
  { id: 8, name: 'Хачапури с мясом', category: 'Пирожки', emoji: '🍖', sales: 0, price: 140 },
  { id: 9, name: 'Матнакаш', category: 'Пирожки', emoji: '🍞', sales: 0, price: 90 },
  { id: 10, name: 'Армянский тонкий лаваш', category: 'Пирожки', emoji: '🫓', sales: 0, price: 60 },
  { id: 11, name: 'Хлеб ржаной', category: 'Пирожки', emoji: '🍞', sales: 0, price: 50 },
  { id: 12, name: 'Хлеб рижский', category: 'Пирожки', emoji: '🥖', sales: 0, price: 55 },
  { id: 13, name: 'Хлеб черный с семечками', category: 'Пирожки', emoji: '🌾', sales: 0, price: 60 },
  
  { id: 14, name: 'Эспрессо', category: 'Кофе и Чай', emoji: '☕', sales: 0, price: 80 },
  { id: 15, name: 'Капучино', category: 'Кофе и Чай', emoji: '☕', sales: 0, price: 120 },
  { id: 16, name: 'Латте', category: 'Кофе и Чай', emoji: '🥛', sales: 0, price: 130 },
  { id: 17, name: 'Американо', category: 'Кофе и Чай', emoji: '☕', sales: 0, price: 90 },
  { id: 18, name: 'Флэт уайт', category: 'Кофе и Чай', emoji: '🤍', sales: 0, price: 140 },
  { id: 19, name: 'Раф', category: 'Кофе и Чай', emoji: '☕', sales: 0, price: 150 },
  { id: 20, name: 'Кофе на песке', category: 'Кофе и Чай', emoji: '🏖️', sales: 0, price: 200 },
  { id: 21, name: 'Чай пакетированный', category: 'Кофе и Чай', emoji: '🍵', sales: 0, price: 60 },
  { id: 22, name: 'Лавандовый раф', category: 'Кофе и Чай', emoji: '💜', sales: 0, price: 170 },
  { id: 23, name: 'Облепиховый чай', category: 'Кофе и Чай', emoji: '🍊', sales: 0, price: 150 },
  
  { id: 24, name: 'Шоколадный кекс', category: 'Сладкое', emoji: '🧁', sales: 0, price: 70 },
  { id: 25, name: 'Армянская пахлава', category: 'Сладкое', emoji: '🍯', sales: 0, price: 100 },
  { id: 26, name: 'Чизкейк классический', category: 'Сладкое', emoji: '🍰', sales: 0, price: 180 },
  { id: 27, name: 'Чизкейк шоколадный', category: 'Сладкое', emoji: '🍫', sales: 0, price: 190 },
  { id: 28, name: 'Наполеон', category: 'Сладкое', emoji: '🎂', sales: 0, price: 150 },
  { id: 29, name: 'Медовик', category: 'Сладкое', emoji: '🍯', sales: 0, price: 140 },
  { id: 30, name: 'Булочки с изюмом, маком', category: 'Сладкое', emoji: '🥐', sales: 0, price: 50 },
  { id: 31, name: 'Пончики', category: 'Сладкое', emoji: '🍩', sales: 0, price: 60 },
  { id: 32, name: 'Сушки', category: 'Сладкое', emoji: '🥨', sales: 0, price: 40 },
  { id: 33, name: 'Печенье монетки', category: 'Сладкое', emoji: '🪙', sales: 0, price: 35 },
  { id: 34, name: 'Печенье с джемом', category: 'Сладкое', emoji: '🍓', sales: 0, price: 45 },
  { id: 35, name: 'Козинаки в шоколаде', category: 'Сладкое', emoji: '🍫', sales: 0, price: 80 },
  
  { id: 36, name: 'Твистер', category: 'Кухня', emoji: '🌯', sales: 0, price: 180 },
  { id: 37, name: 'Твистер де люкс', category: 'Кухня', emoji: '🌯', sales: 0, price: 220 },
  { id: 38, name: 'Бургер', category: 'Кухня', emoji: '🍔', sales: 0, price: 190 },
  { id: 39, name: 'Бургер де люкс', category: 'Кухня', emoji: '🍔', sales: 0, price: 240 },
  { id: 40, name: 'Картофель фри средний', category: 'Кухня', emoji: '🍟', sales: 0, price: 90 },
  { id: 41, name: 'Картофель фри большой', category: 'Кухня', emoji: '🍟', sales: 0, price: 120 },
  { id: 42, name: 'Комбо', category: 'Кухня', emoji: '🍽️', sales: 0, price: 350 },
  
  { id: 43, name: 'Добрый кола', category: 'Напитки', emoji: '🥤', sales: 0, price: 70 },
  { id: 44, name: 'Азвкус сок', category: 'Напитки', emoji: '🧃', sales: 0, price: 80 },
  { id: 45, name: 'Аскания', category: 'Напитки', emoji: '💧', sales: 0, price: 60 },
  { id: 46, name: 'Вода негазированная святой источник', category: 'Напитки', emoji: '💧', sales: 0, price: 50 },
];

const CATEGORY_EMOJIS = {
  'Пирожки': '🍽️',
  'Кофе и Чай': '☕',
  'Сладкое': '🍰',
  'Кухня': '🍔',
  'Напитки': '🥤'
};

const Index = () => {
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('bakery-sales');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [salesHistory, setSalesHistory] = useState<SalesHistory>(() => {
    const saved = localStorage.getItem('bakery-sales-history');
    return saved ? JSON.parse(saved) : {};
  });
  
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('bakery-sales', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('bakery-sales-history', JSON.stringify(salesHistory));
  }, [salesHistory]);

  const updateSales = (id: number, delta: number) => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const product = products.find(p => p.id === id);
    
    if (delta > 0 && product) {
      setSalesHistory(prev => {
        const todayStats = prev[today] || {
          date: today,
          sales: 0,
          revenue: 0,
          productsSold: {}
        };
        
        return {
          ...prev,
          [today]: {
            ...todayStats,
            sales: todayStats.sales + delta,
            revenue: todayStats.revenue + (product.price * delta),
            productsSold: {
              ...todayStats.productsSold,
              [id]: (todayStats.productsSold[id] || 0) + delta
            }
          }
        };
      });
    }

    setProducts(prev =>
      prev.map(p => p.id === id ? { ...p, sales: Math.max(0, p.sales + delta) } : p)
    );
  };

  const categories = useMemo(() => {
    return Object.keys(CATEGORY_EMOJIS);
  }, []);

  const filteredProducts = useMemo(() => {
    return selectedCategory 
      ? products.filter(p => p.category === selectedCategory)
      : products;
  }, [products, selectedCategory]);

  const stats = useMemo(() => {
    const totalSales = products.reduce((sum, p) => sum + p.sales, 0);
    const totalRevenue = products.reduce((sum, p) => sum + (p.sales * p.price), 0);
    const topProducts = [...products].sort((a, b) => b.sales - a.sales).slice(0, 3);
    const categorySales = categories.map(cat => ({
      category: cat,
      sales: products.filter(p => p.category === cat).reduce((sum, p) => sum + p.sales, 0)
    }));
    const maxCategorySales = Math.max(...categorySales.map(c => c.sales), 1);
    
    return { totalSales, totalRevenue, topProducts, categorySales, maxCategorySales };
  }, [products, categories]);

  const chartData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), 6 - i);
      const dateKey = format(date, 'yyyy-MM-dd');
      const dayStats = salesHistory[dateKey] || { sales: 0, revenue: 0 };
      
      return {
        date: format(date, 'dd MMM', { locale: ru }),
        sales: dayStats.sales,
        revenue: dayStats.revenue
      };
    });
    
    return last7Days;
  }, [salesHistory]);

  const categoryRevenueData = useMemo(() => {
    return categories.map(cat => {
      const catProducts = products.filter(p => p.category === cat);
      const revenue = catProducts.reduce((sum, p) => sum + (p.sales * p.price), 0);
      return {
        category: cat,
        revenue
      };
    }).sort((a, b) => b.revenue - a.revenue);
  }, [products, categories]);

  const resetSales = () => {
    if (window.confirm('Сбросить все продажи?')) {
      setProducts(INITIAL_PRODUCTS);
    }
  };

  const exportToExcel = () => {
    const exportData = products.map(p => ({
      'Категория': p.category,
      'Товар': p.name,
      'Цена (₽)': p.price,
      'Продано (шт)': p.sales,
      'Выручка (₽)': p.sales * p.price
    }));

    const categorySummary = categories.map(cat => {
      const catProducts = products.filter(p => p.category === cat);
      return {
        'Категория': cat,
        'Товар': 'ИТОГО',
        'Цена (₽)': '',
        'Продано (шт)': catProducts.reduce((sum, p) => sum + p.sales, 0),
        'Выручка (₽)': catProducts.reduce((sum, p) => sum + (p.sales * p.price), 0)
      };
    });

    const totalRow = {
      'Категория': 'ВСЕГО',
      'Товар': '',
      'Цена (₽)': '',
      'Продано (шт)': stats.totalSales,
      'Выручка (₽)': stats.totalRevenue
    };

    const ws = XLSX.utils.json_to_sheet([...exportData, {}, ...categorySummary, {}, totalRow]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Продажи');
    
    const date = new Date().toLocaleDateString('ru-RU').replace(/\./g, '-');
    XLSX.writeFile(wb, `Продажи_пекарни_${date}.xlsx`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-amber-50 p-3 md:p-6 lg:p-8">
      <div className="max-w-[1800px] mx-auto">
        <header className="mb-6 md:mb-8 animate-fade-in flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold bg-gradient-to-r from-orange-600 to-amber-500 bg-clip-text text-transparent mb-2">
              🥐 Учёт продаж пекарни
            </h1>
            <p className="text-gray-600 text-base md:text-lg">Отслеживайте популярность каждого товара</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button
              onClick={exportToExcel}
              className="gap-2 bg-green-500 hover:bg-green-600 shadow-lg"
            >
              <Icon name="Download" size={18} />
              <span className="hidden sm:inline">Экспорт</span>
            </Button>
            <Button
              variant="destructive"
              onClick={resetSales}
              className="gap-2 shadow-lg"
            >
              <Icon name="RotateCcw" size={18} />
              <span className="hidden sm:inline">Сбросить</span>
            </Button>
          </div>
        </header>

        <Tabs defaultValue="sales" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6 h-auto p-1 bg-white/60 backdrop-blur-sm">
            <TabsTrigger value="sales" className="text-sm md:text-base py-2 md:py-3 data-[state=active]:bg-orange-500 data-[state=active]:text-white">
              <Icon name="ShoppingCart" size={18} className="mr-2" />
              Продажи
            </TabsTrigger>
            <TabsTrigger value="analytics" className="text-sm md:text-base py-2 md:py-3 data-[state=active]:bg-purple-500 data-[state=active]:text-white">
              <Icon name="BarChart3" size={18} className="mr-2" />
              Аналитика
            </TabsTrigger>
          </TabsList>

          <TabsContent value="sales" className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
              <Card className="bg-white/90 backdrop-blur-sm border-orange-200 shadow-lg animate-scale-in hover:shadow-xl transition-shadow">
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-600 text-xs md:text-sm">Всего продаж</span>
                    <Icon name="TrendingUp" className="text-orange-500" size={20} />
                  </div>
                  <p className="text-2xl md:text-4xl font-heading font-bold text-orange-600">{stats.totalSales}</p>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm border-green-200 shadow-lg animate-scale-in hover:shadow-xl transition-shadow" style={{ animationDelay: '0.05s' }}>
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-600 text-xs md:text-sm">Выручка</span>
                    <Icon name="DollarSign" className="text-green-500" size={20} />
                  </div>
                  <p className="text-xl md:text-3xl font-heading font-bold text-green-600">{stats.totalRevenue.toLocaleString('ru-RU')} ₽</p>
                </CardContent>
              </Card>

              <Card className="col-span-2 bg-white/90 backdrop-blur-sm border-purple-200 shadow-lg animate-scale-in hover:shadow-xl transition-shadow" style={{ animationDelay: '0.1s' }}>
                <CardContent className="p-4 md:p-6">
                  <h3 className="font-heading font-semibold text-gray-700 mb-3 md:mb-4 flex items-center gap-2 text-sm md:text-base">
                    <Icon name="Award" className="text-purple-500" size={20} />
                    Топ-3 товара
                  </h3>
                  <div className="space-y-2 md:space-y-3">
                    {stats.topProducts.map((product, index) => (
                      <div key={product.id} className="flex items-center gap-2 md:gap-3">
                        <Badge className="text-base md:text-2xl bg-purple-100 hover:bg-purple-100 text-purple-800 font-heading px-2 py-1">
                          {index + 1}
                        </Badge>
                        <span className="text-lg md:text-2xl">{product.emoji}</span>
                        <span className="flex-1 font-medium text-gray-700 text-xs md:text-base truncate">{product.name}</span>
                        <Badge variant="secondary" className="bg-purple-50 text-purple-700 text-xs md:text-sm">
                          {product.sales}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex gap-2 md:gap-3 overflow-x-auto pb-2 scrollbar-hide animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <Button
                size="sm"
                variant={selectedCategory === null ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(null)}
                className="whitespace-nowrap text-xs md:text-sm shrink-0"
              >
                Все товары
              </Button>
              {categories.map(cat => (
                <Button
                  key={cat}
                  size="sm"
                  variant={selectedCategory === cat ? 'default' : 'outline'}
                  onClick={() => setSelectedCategory(cat)}
                  className="whitespace-nowrap gap-1.5 md:gap-2 text-xs md:text-sm shrink-0"
                >
                  <span>{CATEGORY_EMOJIS[cat as keyof typeof CATEGORY_EMOJIS]}</span>
                  <span className="hidden sm:inline">{cat}</span>
                </Button>
              ))}
            </div>

            <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 2xl:columns-5 gap-3 md:gap-4 space-y-3 md:space-y-4">
              {filteredProducts.map((product, index) => (
                <Card 
                  key={product.id} 
                  className="break-inside-avoid bg-white/95 backdrop-blur-sm border-amber-200 shadow-md hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] animate-fade-in group"
                  style={{ animationDelay: `${0.3 + index * 0.01}s` }}
                >
                  <CardContent className="p-3 md:p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="text-3xl md:text-4xl mb-2">{product.emoji}</div>
                        <h3 className="font-medium text-gray-800 text-xs md:text-sm leading-tight mb-1.5 line-clamp-2">
                          {product.name}
                        </h3>
                        <div className="flex gap-1.5 md:gap-2 flex-wrap">
                          <Badge variant="outline" className="text-[10px] md:text-xs bg-amber-50 border-amber-300 text-amber-700 px-1.5 py-0.5">
                            {product.category}
                          </Badge>
                          <Badge variant="outline" className="text-[10px] md:text-xs bg-green-50 border-green-300 text-green-700 font-semibold px-1.5 py-0.5">
                            {product.price} ₽
                          </Badge>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1 ml-2">
                        <Badge className="bg-orange-500 hover:bg-orange-600 text-white font-heading text-base md:text-lg px-2 md:px-3 py-1">
                          {product.sales}
                        </Badge>
                        {product.sales > 0 && (
                          <span className="text-[10px] md:text-xs text-green-600 font-semibold">
                            {(product.sales * product.price).toLocaleString('ru-RU')} ₽
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-2 mt-3">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateSales(product.id, -1)}
                        disabled={product.sales === 0}
                        className="flex-1 border-orange-300 text-orange-600 hover:bg-orange-50 hover:border-orange-400 transition-all h-9 md:h-10 active:scale-95"
                      >
                        <Icon name="Minus" size={16} />
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => updateSales(product.id, 1)}
                        className="flex-1 bg-orange-500 hover:bg-orange-600 text-white shadow-md hover:shadow-lg transition-all h-9 md:h-10 active:scale-95"
                      >
                        <Icon name="Plus" size={16} />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-purple-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                    <Icon name="TrendingUp" className="text-purple-500" size={24} />
                    Динамика продаж за 7 дней
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                        }}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="sales" 
                        stroke="#f97316" 
                        strokeWidth={3}
                        name="Продажи (шт)" 
                        dot={{ fill: '#f97316', r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-green-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                    <Icon name="DollarSign" className="text-green-500" size={24} />
                    Динамика выручки за 7 дней
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                        }}
                        formatter={(value: number) => `${value.toLocaleString('ru-RU')} ₽`}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="revenue" 
                        stroke="#22c55e" 
                        strokeWidth={3}
                        name="Выручка (₽)" 
                        dot={{ fill: '#22c55e', r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-orange-200 lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                    <Icon name="BarChart3" className="text-orange-500" size={24} />
                    Выручка по категориям
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={categoryRevenueData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="category" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                        }}
                        formatter={(value: number) => `${value.toLocaleString('ru-RU')} ₽`}
                      />
                      <Legend />
                      <Bar 
                        dataKey="revenue" 
                        fill="#f97316" 
                        name="Выручка (₽)"
                        radius={[8, 8, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-amber-200 lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                    <Icon name="PieChart" className="text-amber-500" size={24} />
                    Продажи по категориям
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {stats.categorySales.map(({ category, sales }) => (
                      <div key={category}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-gray-700 flex items-center gap-2 text-sm md:text-base">
                            <span className="text-xl md:text-2xl">{CATEGORY_EMOJIS[category as keyof typeof CATEGORY_EMOJIS]}</span>
                            {category}
                          </span>
                          <span className="text-orange-600 font-semibold text-sm md:text-base">{sales} шт</span>
                        </div>
                        <Progress 
                          value={(sales / stats.maxCategorySales) * 100} 
                          className="h-3"
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
