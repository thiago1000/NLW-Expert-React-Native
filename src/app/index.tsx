import { CategoryButton } from '@/components/category-button'
import Header from '@/components/header'
import { Text, View } from 'react-native'

export default function Home() {
  return (
    <View className="pt-16 flex-1">
      <Header title="Faça seu pedido" cartQuantityItems={3} />
      <CategoryButton title='Lanche do dia' />
    </View>
  )
}