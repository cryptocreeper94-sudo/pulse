import WalletManager from './WalletManager'

export default function WalletTab({ userId }) {
  return (
    <div className="tab-content wallet-tab">
      <WalletManager userId={userId} />
    </div>
  )
}
